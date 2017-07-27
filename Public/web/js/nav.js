$(function()
{
    var $li = $(".NavMenu .nav").find("li");
    $li.hover(function()
    {
        $(this).addClass("current")
		.find(".nav-lv2").show();
		$(this).children("a").addClass("nav_current");
		$(".nav-lv2 dd a").css("background","none");
    }, function()
    {
        $(this).removeClass("current")
		.find(".nav-lv2").hide();
		$(this).children("a").removeClass("nav_current");

    });
});