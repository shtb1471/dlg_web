 function setProcess(){  
  var processbar = document.getElementById("processbar");  
  processbar.style.width = parseInt(processbar.style.width) + 1 + "%";
  processbar.innerHTML = processbar.style.width;  
  if(processbar.style.width == "100%"){  
     window.clearInterval(bartimer);  
  }  
 }  
var bartimer = window.setInterval(function(){setProcess();},10);  
window.onload = function(){  
   bartimer;  
} 