function setDataInLocalStorage(year) {
  const raceEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/races.php?season="+year;  
  const resultEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/results.php?season="+year;  
  const qualifyingEndpoint = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/qualifying.php?season="+year;  

  fetchData(raceEndpoint, "raceDataFor"+year) // fetchRaces();
  fetchData(resultEndpoint, "resultDataFor"+year) // fetchResults();
  fetchData(qualifyingEndpoint, "qualifyingDataFor"+year) // fetchQualifying();
}

function fetchData(endpointUrl, dataName) {
  fetch(endpointUrl)
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
    localStorage.setItem(dataName, JSON.stringify(data));
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}

// Load the data and store it in the local storage
document.addEventListener('DOMContentLoaded', function() {
  hideData('ResultCol');
  hideData('qualifyingCol');
  // const loader = document.querySelector("#loader");
  // loader.style.display = 'none';

  // Retrieve data from localStorage
  // const dataFor2020 = localStorage.getItem('dataFor2020');
  // const dataFor2021 = localStorage.getItem('dataFor2021');
  // const dataFor2022 = localStorage.getItem('dataFor2022');
  // const dataFor2023 = localStorage.getItem('dataFor2023');

  // if (!dataFor2020) {
  //   setDataInLocalStorage(2020, 'dataFor2020');
  // } 

  // if (!dataFor2021) {
  //   setDataInLocalStorage(2021, 'dataFor2021');
  // } 

  // if (!dataFor2022) {
  //   setDataInLocalStorage(2022, 'dataFor2022');
  // } 

  // if (!dataFor2023) {
  //   setDataInLocalStorage(2023, 'dataFor2023');
  // } 
  
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

if(raceYearElement) {
  raceYearElement.addEventListener('change', function() {
    const raceData = localStorage.getItem("raceDataFor"+raceYearElement.value);
    const resultData = localStorage.getItem("resultDataFor"+raceYearElement.value);
    const qualifyingData = localStorage.getItem("qualifyingDataFor"+raceYearElement.value);

    if (!raceData) {
      setDataInLocalStorage(raceYearElement.value, "raceDataFor"+raceYearElement.value);
    }

    if (!resultData) {
      setDataInLocalStorage(raceYearElement.value, "resultDataFor"+raceYearElement.value);
    }

    if (!qualifyingData) {
      setDataInLocalStorage(raceYearElement.value, "qualifyingDataFor"+raceYearElement.value);
    }

    displayRace(raceData);
    hideData('home');
  });
}

function displayRace(raceData) {
  const tableBody = document.getElementById('raceYearData');
  // console.log(raceData);
  JSON.parse(raceData).forEach(item => {
    // Get the current URL
    let currentUrl = window.location.href;

    // Create a URL object
    let parsedUrl = new URL(currentUrl);

    // Get the path without the query string
    let uriWithoutQuery = parsedUrl.pathname;

    const tr = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = item.name;
    tr.appendChild(name);
    
    const timeTd = document.createElement('td');
    timeTd.textContent = item.time;
    tr.appendChild(timeTd);
    
    const resultLinkTd = document.createElement('td');
    
    const aTag = document.createElement('a');
    aTag.setAttribute('href', uriWithoutQuery+'?raceId='+item.id);
    aTag.setAttribute('id', 'raceResultLink');
    aTag.addEventListener('click', () => {
      event.preventDefault();
      displayResults(document.getElementById('raceYearSelect').value, item.id);
      displayQualifying(document.getElementById('raceYearSelect').value, item.id);
      event.preventDefault();
    } ); 
    
    const aButton = document.createElement('button');
    aButton.setAttribute('class', 'btn btn-primary');
    aButton.textContent = "Results";
    
    aTag.appendChild(aButton);
    resultLinkTd.appendChild(aTag);

    tr.appendChild(resultLinkTd);
    
    // Append the row to the table body
    tableBody.appendChild(tr);

    hideData('ResultCol');
    hideData('qualifyingCol');
  });

}

async function fetchDriverConsCircuit(endpointUrl) {
  try {
    const response = await fetch(endpointUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    // Wait for the response and parse it into JSON
    const data = await response.json();
    return data; // Return the parsed data
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null; // Return null if there's an error
  }
}

function printDriverBio(driver) {
  document.getElementById("driverfullName").innerHTML = driver.forename + " " + driver.surname;
  document.getElementById("driverAge").innerHTML =  new Date().getFullYear() - (new Date(driver.dob)).getFullYear() + " years old";
  document.getElementById("driverCode").innerHTML = driver.code;
  document.getElementById("driverNationality").setAttribute("title", driver.nationality);
  document.getElementById("driverNationality").setAttribute("alt", driver.nationality);
  const flag = countries[driver.nationality];
  document.getElementById("driverNationality").setAttribute("src", "https://raw.githubusercontent.com/lipis/flag-icons/02b8adceb338125c61f7a1d64d6e5bd9826ae427/flags/1x1/" + flag + ".svg");  
  document.getElementById("driverWikiLink").innerHTML = driver.url;
}

function printDriverRaces(drivers) {
  const driverRacesTbody = document.getElementById("driverRaces");
  
  driverRacesTbody.textContent = '';

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

function displayResults(raceYearSelect, raceId) {
  showData('ResultCol');
  showData('qualifyingCol');
  const tableBody = document.getElementById('raceResultData');

  let resultData = localStorage.getItem("resultDataFor"+raceYearSelect);

  resultData = JSON.parse(resultData).filter(result => result.race.id == raceId)

  resultData.forEach(item => {
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
      const driverId = driverLink.getAttribute('id'); // Get driver ID from the link
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

    const consBtn = document.createElement('button');
    consBtn.setAttribute('class', 'btn btn-primary');
    consBtn.textContent = item.constructor.name;

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

function displayQualifying(raceYearSelect, raceId) {
  showData('ResultCol');
  showData('qualifyingCol');

  const tableBody = document.getElementById('raceQualifyingData');

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
    driverLink.setAttribute('id', "driver"+item.driver.id);

    const driverBtn = document.createElement('button');
    driverBtn.setAttribute('class', 'btn btn-primary');
    driverBtn.textContent = item.driver.forename + ' ' + item.driver.surname;

    driver.appendChild(driverLink);
    driverLink.appendChild(driverBtn);
    tr.appendChild(driver);

    // Constructor
    const constructor = document.createElement('td');

    const consLink = document.createElement('a');
    consLink.setAttribute('id', "constructor"+item.constructor.id);

    const consBtn = document.createElement('button');
    consBtn.setAttribute('class', 'btn btn-primary');
    consBtn.textContent = item.constructor.name;

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


