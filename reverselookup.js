/*
DESCENSION ITEM LOOKUP APP
Version: 1.01
Author: Matt Cardinal
Description: A simple webapp which looks up base item stats for Descension.
  Stores item and most probability information in a JSON file accessed by
  http request, handles logic with javascript, uses css for style and html
  to show content.
Files: reverselookup.js, reverselookup.css, rollJSON.txt, index.html, blaklowtuz.ico
Version Notes (1.0.1):
  *Fixed issue for Chrome users where the app would fill the page height
  *Alphabetized subtype options upon generation
  *Added documentation
*/

var masterTable;
var item = {tier: "1", source: "store", type: "weapon", subtype:""};

function wrapper (){
  xmlRequests();
}

function xmlRequests () {
  //this runs on load, so it's part wrapper and part xml request.  should probably be split into two.
  var tableRequest = new XMLHttpRequest();
  var url = "rollJSON.txt";
  tableRequest.onreadystatechange = function() {
      if (tableRequest.readyState == 4 && tableRequest.status == 200) {
          masterTable = JSON.parse(tableRequest.responseText);
          document.getElementById("lookupType").selectedIndex = 0;
          createSelect(masterTable[item.source][item.type]);
      }
  };
  tableRequest.open("GET", url, true);
  tableRequest.send();
}

function onChangeTypeSelect(){
  //creates a new list of subtype options when the type select element is modified
  document.getElementById("lookupSubtype").innerHTML = "";
  var typeSelect = document.getElementById("lookupType");
  item.type = typeSelect.options[typeSelect.selectedIndex].value;
  return createSelect(masterTable[item.source][item.type]);
}

function createSelect(list){
  //looks through table for members of item type, and outputs all non-duplicates as alphabetized options in a select element
  var tempList = [];
  for (member in list) {
    for (entry in list[member]){
      if (tempList.indexOf(list[member][entry]) == -1){
        tempList.push(list[member][entry]);
      }
      }
    }
    tempList = tempList.sort();
    for (thing in tempList){
      var option = document.createElement("OPTION");
      var t = document.createTextNode(tempList[thing]);
      option.appendChild(t);
      document.getElementById("lookupSubtype").appendChild(option);
    }
}

function onStatsClick(){
  //gets the stats of an item, then outputs them to the lookupResult div after formatting
  var output = getStats();
  document.getElementById("lookupResult").innerHTML = "";
  document.getElementById("lookupResult").innerHTML += "<b>Tier " + item.tier + " " + item.subtype +  "</b><br /> <br />" + output;
}
function getStats(){
  /* This function gets the stats of an item. The logic is different depending
  on the item type, but items are generally stored as an array of string-value
  pairs. The function loops through each pair, looks for a combination of the
  initial value and the tier number, then adds it to the paired base value.
  Exceptions are made for unusual types.*/

  // get all necessary tables and variables
  var typeSelect = document.getElementById("lookupType");
  item.type = typeSelect.options[typeSelect.selectedIndex].value;
  var subtypeSelect = document.getElementById("lookupSubtype");
  item.subtype = subtypeSelect.options[subtypeSelect.selectedIndex].value;
  var tierSelect = document.getElementById("lookupTier");
  item.tier = tierSelect.options[tierSelect.selectedIndex].value;
  var progressionTable = masterTable.stats.progression;
  var baseTable = masterTable.stats.base;
  var statString = "";
  var baseStats = baseTable[item.subtype];
  var tierIndex = Number(item.tier) - 1;
  for (stat in baseStats){
  var postString = "";
  var searchString = "";
  var dmgNum = "";
  var dieNum = "";
  var noProg = false;

  // set search string based on attribute type
  if (baseStats[stat][0].indexOf("Requirement")>0){
    searchString = "base";
    searchString += baseStats[stat][1];
  } else if(baseStats[stat][0] == "DR"){
    searchString = "DR"+ Number(baseStats[stat][1].substring(0, 1));
    postString = baseStats[stat][1].substring(1);
  } else if (baseStats[stat][0].indexOf("Damage")>0){
    // splits string on location of "d" and location of "+". Only use string of form "ndx+y"
    searchString = baseStats[stat][0];
    dieNum = Number(baseStats[stat][1].substring(0, baseStats[stat][1].indexOf("d")));
    postString = baseStats[stat][1].substring(baseStats[stat][1].indexOf("d"), baseStats[stat][1].indexOf("+")) + " + ";
    dmgNum = Number(baseStats[stat][1].substring(baseStats[stat][1].indexOf("+")+1, baseStats[stat][1].length));
  }
  // filters stats without progression - might be better handled with a database
  else if ((baseStats[stat][0] == "Range")||(baseStats[stat][0] == "Value")||(baseStats[stat][0] == "Special Stats")||(baseStats[stat][0] == "Hands")){
    noProg = true;
    newStat = baseStats[stat][1];
  }
    else {
    searchString = baseStats[stat][0];
    searchString += baseStats[stat][1];
    }
    if (noProg == false){
      var newStat = progressionTable[searchString][tierIndex];
      // gets damage numbers from a string
      if (dieNum){
        dieNum += dieNum*Number(newStat.substring(0, newStat.indexOf("x")));
        dmgNum += Number(newStat.substring(newStat.indexOf("x")+1, newStat.length));
        newStat = dieNum;
      }
    }
    // puts each stat on a different line
    statString += baseStats[stat][0] + ": " + newStat + postString + dmgNum + "<br />";
  }
  return(statString);
}
window.onload = wrapper();
