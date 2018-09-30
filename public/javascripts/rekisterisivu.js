$(function() {
  $("input").after($("<span/>"));
    
  $("#username").change(function() {
    if($(this).val().length > 0) {
      $.get("/onkonimijoolemassa/" + $("#username").val(), function(data) {
        if(data.length > 0) {
          $("#username").parent().attr("class", "form-group has-feedback has-error").find("span").attr("class", "glyphicon glyphicon-remove form-control-feedback");
        } else {
          $("#username").parent().attr("class", "form-group has-feedback has-success").find("span").attr("class", "glyphicon glyphicon-ok form-control-feedback");
        }
      });
    } else {
      $("#username").parent().attr("class", "form-group has-feedback has-error").find("span").attr("class", "glyphicon glyphicon-remove form-control-feedback");
    }
  });
  
  $("#salasana").change(function() {
    $("#salasana").parent().attr("class", "form-group has-feedback has-success").find("span").attr("class", "glyphicon glyphicon-ok form-control-feedback");
  });
  
  $("#salasana2").change(function() {
    if($("#salasana").val() === $("#salasana2").val()) {
      $("#salasana2").parent().attr("class", "form-group has-feedback has-success").find("span").attr("class", "glyphicon glyphicon-ok form-control-feedback");
    } else {
      $("#salasana2").parent().attr("class", "form-group has-feedback has-error").find("span").attr("class", "glyphicon glyphicon-remove form-control-feedback");
    }
  });
  
  $("#email").change(function() {
    $.get("/onkoemailjoolemassa/" + $("#email").val(), function(data) {
      if(data.length > 0) {
        $("#email").parent().attr("class", "form-group has-feedback has-error").find("span").attr("class", "glyphicon glyphicon-remove form-control-feedback");
      } else {
        $("#email").parent().attr("class", "form-group has-feedback has-success").find("span").attr("class", "glyphicon glyphicon-ok form-control-feedback");
      }
    });
  });
  
  $("#rekisterinappi").click(function() {
    if($(".has-success").length < 4) {
      alert("Please check that your information is correct before you can register an account!");
    } else {
      $.post("/register", {
        username: $("#username").val(),
        salasana: $("#salasana").val(),
        email: $("#email").val()
      }, function(data) {
        if(data === "Success") {
          location.replace("/registersuccess");
        }
      });
    }
  });
});