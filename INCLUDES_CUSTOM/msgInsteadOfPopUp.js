// expression message hack
variable2.message="BLAH <img src='/jetspeed/accela/images/spacer.gif' onLoad='alert(\"blah\");'>";
                                expression.setReturn(variable2);

// before message hack
if (showMessage)
                  aa.env.setValue("ScriptReturnMessage",
                              "<img src='/jetspeed/accela/images/spacer.gif' onLoad=\"window.opener.document.getElementById('err_msg').innerHTML='<blockquote><div class=SpecialInfo>"
                                          + message + "</div></blockquote>'; window.close();\">");         
 
