$(function() {
  
  var tavaramj = "";
  
  $(".tuotediv").each(function() {
    if(sessionStorage.getItem("saimaastill_tuote_" + $(this).data("tuote"))) {
      $(this).find("span").text(sessionStorage.getItem("saimaastill_tuote_" + $(this).data("tuote")));
      tavaramj += "," + $(this).data("tuote") + "," + sessionStorage.getItem("saimaastill_tuote_" + $(this).data("tuote"));
    } else {
      $(this).remove();
    }
  });
  
  tavaramj = tavaramj.substring(1, tavaramj.length);
  
  $("#tilausnappi").click(function() {
    $.post("/tilaa", {
      etunimi: $("#etunimi").val(),
      sukunimi: $("#sukunimi").val(),
      hinta: 25,
      spostiosoite: $("#email").val(),
      postiosoite: $("#osoite").val(),
      postinumero: $("#postinumero").val(),
      postitoimipaikka: $("#postitt").val(),
      tavaramerkkijono: tavaramj
    }, function(data) {
      if(data === "Success") {
        location.replace('/ordersuccess');
      } else {
        alert(JSON.stringify(data));
      }
    });
  });
});