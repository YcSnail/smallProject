
/*  
**    ====================================
**    类名：CLASS_LIANDONG_YAO  
**    功能：多级连动菜单  
**    作者：YAODAYIZI     
**/  	
  function CLASS_LIANDONG_YAO(array)
  {
   //数组，联动的数据源
  	this.array=array; 
  	this.indexName='';
  	this.obj='';
  	//设置子SELECT
	// 参数：当前onchange的SELECT ID，要设置的SELECT ID
      this.subSelectChange=function(selectName1,selectName2)
  	{
  	//try
  	//{
    var obj1=document.all[selectName1];
    var obj2=document.all[selectName2];
    var objName=this.toString();
    var me=this;
    obj1.onchange=function()
    {
    	me.optionChange(this.options[this.selectedIndex].value,obj2.id)
    }
  	}
  	//设置第一个SELECT
	// 参数：indexName指选中项,selectName指select的ID
  	this.firstSelectChange=function(indexName,selectName)  
  	{
  	this.obj=document.all[selectName];
  	this.indexName=indexName;
  	this.optionChange(this.indexName,this.obj.id)
  	}
  // indexName指选中项,selectName指select的ID
  	this.optionChange=function (indexName,selectName)
  	{
    var obj1=document.all[selectName];
	if (indexName=="新生儿存储"){ 
document.getElementById("change_form").action="plan/Charge1.asp"; 
} 
else if(indexName=="成人存储"){ 
document.getElementById("change_form").action="crplan/ccjh.asp"; 
}
    var me=this;
    obj1.length=0;
    obj1.options[0]=new Option("请选择",'');
    for(var i=0;i<this.array.length;i++)
    {	
    	if(this.array[i][1]==indexName)
    	{
    	//alert(this.array[i][1]+" "+indexName);
      obj1.options[obj1.length]=new Option(this.array[i][2],this.array[i][0]);
    	}
    }
  	}	
  }
  
  
        var t = n = count = 0;
	        function goScroll(id){
		        var t = n = 0, count = $(id + " .scroll_list li").size();
		        if(count>0){
			        $(id + " .scroll_list li").eq(0).show();
			        createScroll_switch(id,count);
			        $(id + " .scroll_switch li").eq(0).addClass("hover");
		        }
        		
		        $(id + " .scroll_switch li").click(function(){
			        var i = $(id + " .scroll_switch li").index(this);
			        n = i;
			        if (i >= count + 1) return;
			        $(this).addClass("hover").siblings().removeClass("hover");
			        $(id + " .scroll_list li").eq(i).fadeIn(500).siblings().hide();
        				
		        });
		        t = setInterval(function(){showAuto(id,count,n)}, 4000);
		        $(id).hover(
			        function(){clearInterval(t)},
			        function(){t = setInterval(function(){showAuto(id,count,n)}, 4000);}
		        );
	        }
	        function showAuto(id,count,n){
		        n = n >= (count - 1) ? 0 : ++n;
		        $(id + " .scroll_switch li").eq(n).trigger('click');
	        }
	        function createScroll_switch(id,count){
		        for (i=1;i<=count;i++){
			        $(id + " .scroll_switch").append("<li></li>");
		        }
	        }