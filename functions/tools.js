module.exports = function(){

this.ajaxGet = function(url, callback) {
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var req = new XMLHttpRequest();
    req.open("GET", url);
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            callback(req.responseText);
        } else {
            console.error(req.status + " " + req.statusText + " " + url);
        }
    });
    req.addEventListener("error", function () {
        console.error("Erreur réseau avec l'URL " + url);
    });
    req.send(null);
};


this.checkRooms = function(takenIds, rooms){
var roomList = rooms.slice();
roomList.forEach(function(room, key){
takenIds.forEach(function(id){
if (id['id_room'] === key)
{
	delete roomList[key];
	}
});
});
return(roomList);
};

}
