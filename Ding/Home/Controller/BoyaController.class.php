<?php
namespace Home\Controller;
use Think\Controller;
class BoyaController extends Controller {
    public function index(){
        $t = '2017-07-26 10';
        $t2 = '2017-07-28 10';

        $stratTime = $this->changeTime($t);
        $endTime = $this->changeTime($t2);

        //计算之间 共有几天
        $contHour = $this->contHour($stratTime[0],$endTime[0]);

        //精确计算 多少小时;
        $startHour = $stratTime[1];
        $endHour = $endTime[1];

        //判断是不是上午
        //并计算请假当天距离下班的时间
        if ( (8 <= $startHour)  && ($startHour <= 12)){
            $qingTime = 12 - $startHour + 5;
            echo '上午';
        }else{
            echo '下午';
            $qingTime = 17 - $startHour;
        }
        echo $qingTime;
        echo '<br>';

        //并计算请假结束当天距离上班的时间
        if ( (8 <= $endHour)  && ($endHour <= 12)){
            //  10 - 8; 上午2小时
            //  12 - 8; 上午4小时

            $zhongTime = $endHour - 8;
            echo '上午';
        }else{

            echo '下午';
            $zhongTime = 17 - $endHour + 3;
        }
        echo $zhongTime;
        die();

        var_dump($hour);
        die();

        $this->display();
    }

    /**
     * 获取有多少小时
     * @param $stattime
     * @param $endtime
     * @return bool|float|int
     */
    public function contHour($stattime,$endtime){
        if (empty($stattime) || empty($endtime)){
            return false;
        }
        $stattime = strtotime($stattime);
        $endtime = strtotime($endtime);
        $contDay = ($endtime - $stattime)/ 86400;
        $contHour = $contDay * 8;
        return $contHour;
    }

    /**
     * string 转 array
     * @param $time
     * @return array
     */
    public function changeTime($time){
        $stratTime = explode(' ',$time);
        return $stratTime;
    }


}