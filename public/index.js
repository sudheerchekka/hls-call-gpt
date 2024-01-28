window.addEventListener('load', async () => {
    const convoList = document.getElementById('transcript');
    const tasksList = document.getElementById('tasks-list');
    //const loadingMessage = document.getElementById('loading-message');

    try {
      // Get the Sync access token and list name from the serverless function
      /*const { syncListName, token } = await fetch('/access').then(async (res) =>
      {
          var body =  await res.json();
          console.log(body);

          res.json()
      }
      );*/
      const response = await fetch('/access');
      const responseJSON = await response.json();
      const convoSyncListName = responseJSON.convoSyncListName;
      const tasksSyncListName = responseJSON.taskSyncListName;
      token = responseJSON.token;

      const syncClient = new Twilio.Sync.Client(token);
      const convoSyncList = await syncClient.list(convoSyncListName);
      const tasksSyncList = await syncClient.list(tasksSyncListName);

      // Get the most recent messages (if any) in the List
      const existingConvoItems = await convoSyncList.getItems({ order: 'desc' });
      const existingTasksItems = await tasksSyncList.getItems({ order: 'desc' });

      //console.log(existingConvoItems.items);

      /// Add message to call transcript element
      function addMessage(role, text) {
        var transcriptContainer = document.querySelector(".transcript");
  
        var messageContainer = document.createElement("div");
        messageContainer.classList.add("message");
        messageContainer.classList.add(role);
  
        messageContainer.innerHTML = `<span class="${role} title">${role.charAt(0).toUpperCase() + role.slice(1)}:</span> ${text}`;
        transcriptContainer.appendChild(messageContainer);
      }
      
      // Hide the loading message
      //loadingMessage.style.display = 'none';
      // Render any existing messages to the page, remember to reverse the order
      // since they're fetched in descending order in this case
      existingConvoItems.items
        .reverse()
        .map((item) => addMessage(item.data.user,item.data.content))
      // Add an event listener to the List so that incoming messages can
      // be displayed in real-time
      convoSyncList.on('itemAdded', ({ item }) => {
        console.log('Item added:', item);
        // Add the new message to the list by adding a new <li> element
        // containing the incoming message's text
        
        addMessage(item.data.user,item.data.content);
      });
      
      // Create Task list HTML tags
      function createTaskListItem(item) {
        //console.log("task list items");
        //console.log(item);
        // Create the list item (li) element dynamically
        var listItem = document.createElement('li');
        listItem.id = item.data.id+item.index; // Set the id for the list item
        listItem.innerText = item.data.order;

        // Create the button element dynamically
        var dynamicButton = document.createElement('button');
        dynamicButton.textContent = 'Proceed';
        
        // Attach a click event listener to the button
        dynamicButton.addEventListener('click', function() {
            // Pass some data (in this case, a string) to the function
            createLabOrder(item);
        });

        // Append the button to the list item
        listItem.appendChild(dynamicButton);

        // Create the button element dynamically
        var dynamicButtonClear = document.createElement('button');
        dynamicButtonClear.textContent = 'clear';
        
        // Attach a click event listener to the button
        dynamicButtonClear.addEventListener('click', function() {
            // Pass some data (in this case, a string) to the function
            removeTaskListItem(item.index);
        });

        listItem.appendChild(dynamicButtonClear);

        // Append the list item to the container
        tasksList.appendChild(listItem);
      }

      existingTasksItems.items
        .reverse()
        .map((item) => createTaskListItem(item));
      // Add an event listener to the List so that incoming messages can
      // be displayed in real-time
      tasksSyncList.on('itemAdded', ({ item }) => {
        console.log('Task Item added:', item);
        // Add the new message to the list by adding a new <li> element
        // containing the incoming message's text
        createTaskListItem(item);
      });

      tasksSyncList.on('itemRemoved', (item) => {
        console.log('Task Item removed:', item);
        // Add the new message to the list by adding a new <li> element
        // containing the incoming message's text
        let listItem = document.getElementById(item.previousItemData.id+item.index);
        //console.log(listItem);
        tasksList.removeChild(listItem);
      });

      // Make sure to refresh the access token before it expires for an uninterrupted experience! 

      syncClient.on('tokenAboutToExpire', async () => {
        try {
          // Refresh the access token and update the Sync client
          //TODO: fix this. never tested it
          const refreshAccess = await fetch('/access').then((res) =>
            res.json()
          );
          syncClient.updateToken(refreshAccess.token);
        } catch (error) {
          console.error(error);
          /*loadingMessage.innerText =
            'Unable to refresh access to messages 😭, try reloading your page!';
          loadingMessage.style.color = 'red';
          loadingMessage.style.fontWeight = 'bold';*/
        }
      });
      
      function insertDataIntoTable(jsonData) {
        // Select the table using its class
        var table = document.querySelector('.profile-table tbody');
  
        // Iterate over the JSON object and insert a row for each key-value pair
        for (var key in jsonData) {
          if (jsonData.hasOwnProperty(key)) {
            var newRow = table.insertRow();
            var cellKey = newRow.insertCell(0);
            var cellValue = newRow.insertCell(1);
  
            // Set the key and value in the cells
            cellKey.appendChild(document.createTextNode(key));
            cellValue.appendChild(document.createTextNode(jsonData[key]));
          }
        }
      }

      async function fetchProfileTraits(){
        try {
          const profileTraits = await fetch('/profile').then((res) =>
            res.json()
          );
          //console.log(profileTraits);

          // Call the updateTable function with your JSON data
          insertDataIntoTable(profileTraits);
        } catch (error) {
            console.error(error);
        }
      }
      fetchProfileTraits();

      // Orderlab results
      async function createLabOrder(item){
        try {
          console.log("task button clicked")
          const dataJson = {
            phonenumber: item.data.id,
            order: item.data.order
          };
          console.log(dataJson);
          
          const response = await fetch('/savelaborder', {
            method: 'post',
            body: JSON.stringify(dataJson),
            headers: {'Content-Type': 'application/json'}
          });
          
          //remove the task from Sync after adding to EHR
          removeTaskListItem(item.index);

        } catch (error) {
            console.error(error);
        }
      }

      // clear tasklist item when clear clicked
      function removeTaskListItem(itemIndex) {
        console.log("clear clicked to remove index - " + itemIndex);
        tasksSyncList.remove(itemIndex)
          .then(() => {
            console.log('Item removed successfully');
          })
          .catch((error) => {
            console.error('Error removing item:', error);
          });
      }

    } catch (error) {
        console.error(error);
        /*loadingMessage.innerText = 'Unable to load messages 😭';
        loadingMessage.style.color = 'red';
        loadingMessage.style.fontWeight = 'bold';*/
    }

    document.getElementById('getSummaryButton').addEventListener('click', function() {
      fetch('/generate_convosummary')
      .then(response => response.json())
      .then(data => {
          // Display the response data in the textarea
          console.log(data);
          //document.getElementById('summaryTextArea').innerHTML = JSON.stringify(data, null, 2);
          document.getElementById('summaryTextArea').innerHTML = data;
      })
      .catch(error => console.error('Error:', error));
    });
    
});