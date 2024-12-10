// Load the data and store it in the local storage
document.addEventListener('DOMContentLoaded', function() {
  hideData("loader");
  hideData('ResultCol');
  hideData('qualifyingCol');
  hideData('races');
});

let raceYearElement = document.getElementById('raceYearSelect');

function hideData(sectionId) {
  const section = document.getElementById(sectionId);
  section.style.display = 'none';
}

function showData(sectionId) {
  const section = document.getElementById(sectionId);
  section.style.display = 'block';
}
async function setDataInLocalStorage(year) {
  const raceEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/races.php?season=" + year;
  const resultEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/results.php?season=" + year;
  const qualifyingEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/qualifying.php?season=" + year;

  // Wait for all the fetches to complete before proceeding
  // Reference: https://stackoverflow.com/questions/31424561/wait-until-all-promises-complete-even-if-some-rejected
  await Promise.all([
    fetchData(raceEndpoint, "raceDataFor" + year),
    fetchData(resultEndpoint, "resultDataFor" + year),
    fetchData(qualifyingEndpoint, "qualifyingDataFor" + year)
  ]);
}

function fetchData(endpointUrl, dataName) {
  return new Promise((resolve, reject) => {
    fetch(endpointUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem(dataName, JSON.stringify(data));
        resolve(); 
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        // Reference: 
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject
        // https://stackoverflow.com/questions/33445415/javascript-promises-reject-vs-throw
        
        reject(error);
      });
  });
}

if (raceYearElement) {
  raceYearElement.addEventListener('change', async function() {
    hideData('home');
    showData("loader");
    
    const year = raceYearElement.value;
    const raceData = localStorage.getItem("raceDataFor" + year);
    const resultData = localStorage.getItem("resultDataFor" + year);
    const qualifyingData = localStorage.getItem("qualifyingDataFor" + year);

    if (!raceData || !resultData || !qualifyingData) {
      // If any data is missing, fetch and store it
      await setDataInLocalStorage(year); // This will fetch and store all the data
    }

    // Display the race data after all data is set in localStorage
    const updatedRaceData = localStorage.getItem("raceDataFor" + year); // Get the data after it's stored
    hideData("loader");
    displayRace(updatedRaceData);  // Display the race data after it's loaded
  });
}

// Display Circuit popup data
function displayCircuit(circuitData) {
  document.getElementById('circuitName').innerHTML = circuitData.name;
  document.getElementById('circuitHeader').innerHTML = circuitData.name;
  document.getElementById('circuitUrl').innerHTML = "Read More";
  document.getElementById('circuitUrl').setAttribute("href", circuitData.url);
  document.getElementById('circuitUrl').setAttribute("target", "_blank");
  document.getElementById('circuitImg').setAttribute("src", "https://cdn-3.motorsport.com/images/amp/Yv8aRRj0/s1000/general-special-feature-2019-v-2.jpg");
}

// Display race data
function displayRace(raceData) {
  showData('races');
  
  const tableBody = document.getElementById('raceYearData');
  JSON.parse(raceData).forEach(item => {
    // Get the current URL
    let currentUrl = window.location.href;

    // Create a URL object
    let parsedUrl = new URL(currentUrl);

    // Get the path without the query string
    let uriWithoutQuery = parsedUrl.pathname;

    // Table row
    const tr = document.createElement('tr');

    // Circuit TD
    const circuit = document.createElement('td');

    // Circuit link
    const circuitLink = document.createElement('a');
    circuitLink.setAttribute('id', item.circuit.id);

    // Circuit button
    const circuitBtn = document.createElement('button');
    circuitBtn.setAttribute('class', 'btn btn-primary');
    circuitBtn.textContent = item.name;

    // Attach event listener to the circuit link
    circuitLink.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent the default link behavior
      const circuitId = item.circuit.id;
      const circuitEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/circuits.php?id=" + circuitId;
      const circuitData = await fetchDriverConsCircuit(circuitEndpoint);
      displayCircuit(circuitData);
    });

    // Apend btn to link
    circuitLink.appendChild(circuitBtn);
    circuit.appendChild(circuitLink);

    // Set attribute to the circuit modal
    circuitBtn.setAttribute('data-bs-toggle', 'modal');
    circuitBtn.setAttribute('data-bs-target', '#circuitModal');

    // Append circuit to tr
    tr.appendChild(circuit);
    
    // Time td
    const timeTd = document.createElement('td');
    timeTd.textContent = item.time;
    
    // Append time to tr
    tr.appendChild(timeTd);
    
    // Result link td
    const resultLinkTd = document.createElement('td');
    
    // Result link
    const aTag = document.createElement('a');
    aTag.setAttribute('href', uriWithoutQuery+'?raceId='+item.id);
    aTag.setAttribute('id', 'raceResultLink');

    // Attach event handle to result button
    aTag.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent the default link behavior
      // Display race and qualifying
      displayResults(document.getElementById('raceYearSelect').value, item.id);
      displayQualifying(document.getElementById('raceYearSelect').value, item.id);
    } ); 
    
    // Result button
    const aButton = document.createElement('button');
    aButton.setAttribute('class', 'btn btn-primary');
    aButton.textContent = "Results";
    
    // Append button to link
    aTag.appendChild(aButton);
    resultLinkTd.appendChild(aTag);

    // Append link to tr
    tr.appendChild(resultLinkTd);
    
    // Append the row to the table body
    tableBody.appendChild(tr);

    // Hide result and qualifying data
    hideData('ResultCol');
    hideData('qualifyingCol');
  });

}

// Fetch driver, Constructor and circuit data
async function fetchDriverConsCircuit(endpointUrl) {
  try {
    const response = await fetch(endpointUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null;
  }
}

// Print basic driver bio
function printDriverBio(driver) {
  document.getElementById("driverfullName").innerHTML = driver.forename + " " + driver.surname;
  document.getElementById("driverHeader").innerHTML = driver.forename + " " + driver.surname;
  document.getElementById("driverAge").innerHTML =  new Date().getFullYear() - (new Date(driver.dob)).getFullYear() + " years old, DOB: " + driver.dob;
  document.getElementById("driverCode").innerHTML = driver.code;
  document.getElementById("driverNationality").setAttribute("title", driver.nationality);
  document.getElementById("driverNationality").setAttribute("alt", driver.nationality);
  const flag = countries[driver.nationality];
  document.getElementById("driverNationality").setAttribute("src", "https://raw.githubusercontent.com/lipis/flag-icons/02b8adceb338125c61f7a1d64d6e5bd9826ae427/flags/1x1/" + flag + ".svg");  
  document.getElementById("driverWikiLink").innerHTML = "More information";
  document.getElementById("driverWikiLink").setAttribute("href", driver.url);
  document.getElementById("driverWikiLink").setAttribute("target", "_blank");
}

// Print driver races info
function printDriverRaces(drivers) {
  const driverRacesTbody = document.getElementById("driverRaces");
  
  driverRacesTbody.textContent = '';

  // Loop through all drivers
  drivers.forEach(driver => {
    const tr = document.createElement('tr');

    // Round
    const round = document.createElement('td');
    round.textContent = driver.round;
    tr.appendChild(round);

    // Name
    const name = document.createElement('td');
    name.textContent = driver.name;
    tr.appendChild(name);

    // Position
    const position = document.createElement('td');
    position.textContent = driver.positionOrder;
    tr.appendChild(position);

    driverRacesTbody.appendChild(tr);
  }); 
}

// Print constructor basic data
function printConsBasicData(constructor) {
  document.getElementById("consName").innerHTML = constructor.name;
  document.getElementById("consHeader").innerHTML = constructor.name;
  document.getElementById("consWikiLink").setAttribute("href", constructor.url);
  document.getElementById("consWikiLink").setAttribute("target", "_blank");
  document.getElementById("consNationality").setAttribute("title", constructor.nationality);
  document.getElementById("consNationality").setAttribute("alt", constructor.nationality);
  const flag = countries[constructor.nationality];
  document.getElementById("consNationality").setAttribute("src", "https://raw.githubusercontent.com/lipis/flag-icons/02b8adceb338125c61f7a1d64d6e5bd9826ae427/flags/1x1/" + flag + ".svg");
}

// Print constructor races result
function printConsRacesResult(constructors) {
  const consRacesTbody = document.getElementById("consDriverRaces");
  
  consRacesTbody.textContent = '';

  // Loop through the constructors
  constructors.forEach(async constructor => {
    const tr = document.createElement('tr');

    // Round
    const round = document.createElement('td');
    round.textContent = constructor.round;
    tr.appendChild(round);

    // Circuit
    const name = document.createElement('td');
    name.textContent = constructor.name;
    tr.appendChild(name);

    // Driver
    const fullname = document.createElement('td');
    fullname.textContent = constructor.forename + " " + constructor.surname;
    tr.appendChild(fullname);

    // Position
    const position = document.createElement('td');
    position.textContent = constructor.positionOrder;
    tr.appendChild(position);

    consRacesTbody.appendChild(tr);
  });
  
}

// Display results
function displayResults(raceYearSelect, raceId) {
  showData('ResultCol');
  showData('qualifyingCol');
  
  // tbody for result data
  const tableBody = document.getElementById('raceResultData');
  tableBody.textContent = '';

  // Get result for current season race
  let resultData = localStorage.getItem("resultDataFor"+raceYearSelect);

  // filter based on race id
  resultData = JSON.parse(resultData).filter(result => result.race.id == raceId)
  
  // Get top driver 1st, 2nd and 3rd tbody
  const topDriver = document.getElementById("topDriver");
  topDriver.textContent = "";

  // Loop through result data
  resultData.forEach(item => {
    // Set rank
    if(item.position <= 3) {
      if (item.position == 1) {
        rank = "1st";
      } else if (item.position == 2) {
        rank = "2nd";
      } else if (item.position == 3) {
        rank = "3rd";
      }
  
      // Card div
      const card = document.createElement("div");
      card.setAttribute("class", "card mt-2 mb-2 bg-primary text-white");

      // Card body div
      const cardBody = document.createElement("div");
      cardBody.setAttribute("class", "card-body");

      // Card title
      const cardTitle = document.createElement("h1");
      cardTitle.setAttribute("class", "card-title text-center");
      cardTitle.textContent = rank;

      // Card para
      const cardPara = document.createElement("p");
      cardPara.setAttribute("class", "card-text text-center");
      cardPara.textContent = item.driver.forename + " " + item.driver.surname;
      
      // Append cardbody with title, para and card itself to topdriver div
      cardBody.appendChild(cardTitle);
      cardBody.appendChild(cardPara);
      card.appendChild(cardBody);
      topDriver.appendChild(card);
    } 

    // tr
    const tr = document.createElement('tr');

    // Position
    const position = document.createElement('td');
    position.textContent = item.position;
    tr.appendChild(position);

    // Driver
    const driver = document.createElement('td');

    // Driver link
    const driverLink = document.createElement('a');
    driverLink.setAttribute('id', item.driver.id);

    // Attach click event to the driver link
    driverLink.addEventListener('click', async (event) => {
      const driverId = driverLink.getAttribute('id'); // Get driver ID from the link
      const driverBioEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/drivers.php?id=" + driverId;
      const driverBioData = await fetchDriverConsCircuit(driverBioEndpoint);
      
      // Print driver bio
      printDriverBio(driverBioData);
      const driverRacesEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/driverResults.php?driver=" + item.driver.ref + "&season=" + raceYearSelect;

      // Fetch and print driver races data
      const driverRacesData = await fetchDriverConsCircuit(driverRacesEndpoint);
      printDriverRaces(driverRacesData);
      event.preventDefault(); // Prevent the default link behavior
    });

    // Driver button
    const driverBtn = document.createElement('button');
    driverBtn.setAttribute('class', 'btn btn-primary');
    driverBtn.textContent = item.driver.forename + ' ' + item.driver.surname;
    
    // Attach button to the driver modal
    driverBtn.setAttribute('data-bs-toggle', 'modal');
    driverBtn.setAttribute('data-bs-target', '#driverModal');

    // Append button and link to the driver tr
    driver.appendChild(driverLink);
    driverLink.appendChild(driverBtn);
    tr.appendChild(driver);

    // Constructor
    const constructor = document.createElement('td');

    const consLink = document.createElement('a');
    consLink.setAttribute('id', item.constructor.id);
    consLink.setAttribute('target', "_blank");

    consLink.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent the default link behavior
      
      // Fetch and print constructor basic info
      const consId = item.constructor.id;
      const consBasicDataEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructors.php?id=" + consId;
      const consBasicData = await fetchDriverConsCircuit(consBasicDataEndpoint);
      printConsBasicData(consBasicData);

      // Fetch and print constructor races result
      const consRaceDataEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructorResults.php?constructor=" + item.constructor.ref + "&season=" + raceYearSelect;
      const consRaceData = await fetchDriverConsCircuit(consRaceDataEndpoint);
      printConsRacesResult(consRaceData);
    });

    // Constructor button
    const consBtn = document.createElement('button');
    consBtn.setAttribute('class', 'btn btn-primary');
    consBtn.textContent = item.constructor.name;

    // Attach button to the constructor modal
    consBtn.setAttribute('data-bs-toggle', 'modal');
    consBtn.setAttribute('data-bs-target', '#consModal');

    constructor.appendChild(consLink);
    consLink.appendChild(consBtn);
    tr.appendChild(constructor);
    
    // laps
    const laps = document.createElement('td');
    laps.textContent = item.laps;
    tr.appendChild(laps);

    // Points
    const points = document.createElement('td');
    points.textContent = item.points;
    tr.appendChild(points);

    tableBody.appendChild(tr);
    
  });
}

// Display qualifying data
function displayQualifying(raceYearSelect, raceId) {
  showData('ResultCol');
  showData('qualifyingCol');
  
  const tableBody = document.getElementById('raceQualifyingData');
  tableBody.textContent = '';

  let qualifyingData = localStorage.getItem("qualifyingDataFor"+raceYearSelect);

  qualifyingData = JSON.parse(qualifyingData).filter(qualifying => qualifying.race.id == raceId)

  qualifyingData.forEach(item => {
    // Get the current URL
    let currentUrl = window.location.href;

    // Create a URL object
    let parsedUrl = new URL(currentUrl);

    // Get the path without the query string
    let uriWithoutQuery = parsedUrl.pathname;

    const tr = document.createElement('tr');

    // Position
    const position = document.createElement('td');
    position.textContent = item.position;
    tr.appendChild(position);
 
    // Driver
    const driver = document.createElement('td');

    const driverLink = document.createElement('a');
    driverLink.setAttribute('id', item.driver.id);

    driverLink.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent the default link behavior
      const driverId = item.driver.id; // Get driver ID from the link
      const driverBioEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/drivers.php?id=" + driverId;
      const driverBioData = await fetchDriverConsCircuit(driverBioEndpoint);
      printDriverBio(driverBioData);
      const driverRacesEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/driverResults.php?driver=" + item.driver.ref + "&season=" + raceYearSelect;
      const driverRacesData = await fetchDriverConsCircuit(driverRacesEndpoint);
      printDriverRaces(driverRacesData);
    });

    const driverBtn = document.createElement('button');
    driverBtn.setAttribute('class', 'btn btn-primary');
    driverBtn.textContent = item.driver.forename + ' ' + item.driver.surname;
    driverBtn.setAttribute('data-bs-toggle', 'modal');
    driverBtn.setAttribute('data-bs-target', '#driverModal');

    driver.appendChild(driverLink);
    driverLink.appendChild(driverBtn);
    tr.appendChild(driver);

    // Constructor
    const constructor = document.createElement('td');

    const consLink = document.createElement('a');
    consLink.setAttribute('id', "constructor"+item.constructor.id);

    consLink.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent the default link behavior
      const consId = item.constructor.id; // Get driver ID from the link
      const consBasicDataEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructors.php?id=" + consId;
      const consBasicData = await fetchDriverConsCircuit(consBasicDataEndpoint);
      printConsBasicData(consBasicData);
      const consRaceDataEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/constructorResults.php?constructor=" + item.constructor.ref + "&season=" + raceYearSelect;
      const consRaceData = await fetchDriverConsCircuit(consRaceDataEndpoint);
      printConsRacesResult(consRaceData);
    });

    const consBtn = document.createElement('button');
    consBtn.setAttribute('class', 'btn btn-primary');
    consBtn.textContent = item.constructor.name;
    consBtn.setAttribute('data-bs-toggle', 'modal');
    consBtn.setAttribute('data-bs-target', '#consModal');

    constructor.appendChild(consLink);
    consLink.appendChild(consBtn);
    tr.appendChild(constructor);
    
    // Q1
    const q1 = document.createElement('td');
    q1.textContent = item.q1 ? item.q1 : "N/A";
    tr.appendChild(q1);
 
    // Q1
    const q2 = document.createElement('td');
    q2.textContent = item.q2 ? item.q2 : "N/A";
    tr.appendChild(q2);

    // Q3
    const q3 = document.createElement('td');
    q3.textContent = item.q3 ? item.q3 : "N/A";
    tr.appendChild(q3);

    tableBody.appendChild(tr);
  });
}


