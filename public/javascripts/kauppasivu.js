var tuotelista = [];

$(function() {
  $("[data-toggle=popover]").popover({ html: true });
  
  $.get("/productlist", function(data) {
    tuotelista = data;
  }).done(function() {
    updateOstoskori();
  });
  
  $(".additionButton").click(function() {
    alert("Painoit nappia");
    var keksinNimi = "saimaastill_tuote_" + $(this).data("tuote");
    var tuotelistaus = (parseInt(sessionStorage.getItem(keksinNimi)))
                       ? parseInt(sessionStorage.getItem(keksinNimi))
                       + parseInt($("#tuote_" + $(this).data("tuote")).val())
                       : parseInt($("#tuote_" + $(this).data("tuote")).val());
    sessionStorage.setItem(keksinNimi, tuotelistaus);
    $("#tuote_" + $(this).data("tuote")).val(1);
    updateOstoskori();
  });
  
  updateLogin();
});

kirjaudu = function() {
  $.post("/login", {
    tunnus: $("#loginUsername").val(),
    salasana: $("#loginPassword").val()
  }, function(data) {
    if(data == "Success") {
      location.reload();
    } else {
      alert(data);
    }
  });
}

poistatuote = function(numero) {
  sessionStorage.removeItem("saimaastill_tuote_" + numero);
  updateOstoskori();
}

updateLogin = function() {
  $.get("/kirjautunut", function(data) {
    $("#loginPalkki").attr("data-content", data).data("bs.popover").setContent();
  });
}

updateOstoskori = function() {
  var cartHTML = "";
  
  for(i in tuotelista) {
    if(sessionStorage.getItem("saimaastill_tuote_" + tuotelista[i].id)) {
      cartHTML += sessionStorage.getItem("saimaastill_tuote_" + tuotelista[i].id)
                + " x " + tuotelista[i].tuotenimi
                + "<a style='float: right;' onclick=poistatuote(" + tuotelista[i].id
                + ")><span class='glyphicon glyphicon-trash'></span></a><br />";
    }
  }
  
  cartHTML += (cartHTML === "") ? "Your shopping cart is empty." : "<a href='/checkout'>Go to checkout</a>";
  
  $("#ostoskori").attr("data-content", cartHTML).data("bs.popover").setContent();
  
}