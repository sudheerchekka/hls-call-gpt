window.addEventListener('load', async () => {
    const convoList = document.getElementById('convo-list');
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

      console.log(existingConvoItems.items);

      // Hide the loading message
      //loadingMessage.style.display = 'none';
      // Render any existing messages to the page, remember to reverse the order
      // since they're fetched in descending order in this case
      convoList.innerHTML = existingConvoItems.items
        .reverse()
        .map((item) => `<li class="${item.data.user}"><b>${item.data.user} :</b> ${item.data.content}</li>`)
        .join('');
      // Add an event listener to the List so that incoming messages can
      // be displayed in real-time
      convoSyncList.on('itemAdded', ({ item }) => {
        console.log('Item added:', item);
        // Add the new message to the list by adding a new <li> element
        // containing the incoming message's text

        convoList.innerHTML += `<li class="${item.data.user}"><b>${item.data.user} :</b> ${item.data.content}</li>`;
    
      });

      tasksList.innerHTML = existingTasksItems.items
        .reverse()
        .map((item) => `<li>  ${item.data.order} <button id="" onclick="createTask()" >proceed</button><button>clear</button></li>`)
        .join('');
      // Add an event listener to the List so that incoming messages can
      // be displayed in real-time
      tasksSyncList.on('itemAdded', ({ item }) => {
        console.log('Task Item added:', item);
        // Add the new message to the list by adding a new <li> element
        // containing the incoming message's text
        //const newListItem = document.createElement('<input type="checkbox">');
        tasksList.innerHTML += `<li id="${item.id}"> ${item.data.order} <button onclick="createTask(${item})" >proceed</button><button>clear</button></li>`;
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
        var table = document.querySelector('.profile-table');
  
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
          console.log(profileTraits);

          // Call the updateTable function with your JSON data
          insertDataIntoTable(profileTraits);
        } catch (error) {
            console.error(error);
        }
      }
      fetchProfileTraits();

      // Orderlab results
      async function createTask(item){
        try {
          const response = await fetch('/order', {
            method: 'post',
            body: item,
            headers: {'Content-Type': 'application/json'}
          });
          const data = await response.json();
          console.log(data);

        } catch (error) {
            console.error(error);
        }
      }

    } catch (error) {
        console.error(error);
        /*loadingMessage.innerText = 'Unable to load messages 😭';
        loadingMessage.style.color = 'red';
        loadingMessage.style.fontWeight = 'bold';*/
    }
    
});