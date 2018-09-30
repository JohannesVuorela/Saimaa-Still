$(function() {
  $(".additionButton").click(function() {
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
  updateOstoskori();
});

kirjaudu = function() {
  $("#loginNappi").click(function() {
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
  });
}

updateLogin = function() {
  $.get("/kirjautunut", function(data) {
    $("#loginpalkki").html(data);
  });
}

updateOstoskori = function() {
  var cartHTML = "<h3>Shopping Cart</h3>";
  
  $(".additionButton").each(function() {
    if(sessionStorage.getItem("saimaastill_tuote_" + $(this).data("tuote"))) {
      cartHTML += sessionStorage.getItem("saimaastill_tuote_" + $(this).data("tuote"))
                + " x " + $("#tuotediv_" + $(this).data("tuote")).find("p").first().text()
                + "<a style='float: right;' data-poistettavatuote=" + $(this).data("tuote")
                + "><span class='glyphicon glyphicon-trash'></span></a><br />";
    }
  });
  
  $("#ostoskori").html(cartHTML);
  
  var poistoLinkit = $("#ostoskori").find("a");
  if(poistoLinkit.length > 0) {
    poistoLinkit.click(function() {
      sessionStorage.removeItem("saimaastill_tuote_" + $(this).data("poistettavatuote"));
      updateOstoskori();
    });
    $("#ostoskori").append("<a class='btn btn-block btn-success' href='http://localhost:5000/checkout' style='margin-top:10px;'>Go to checkout</a>");
  } else {
    $("#ostoskori").append("<p>Your shopping cart is empty.</p>")
  }
}