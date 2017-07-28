<?php
namespace Home\Controller;
use Think\Controller;
class BoyaController extends Controller {
    public function index(){

        $stratTime = '2017-07-27 14:00'.':00';
        $endTime =   '2017-07-29 14:30'.':00';

        $time = $this->computationTime($stratTime,$endTime);
        var_dump($time);
        die();

        $this->display();
    }

    /**
     *
     * @param $stratTime
     * @param $endTime
     * @return int
     */
    public function computationTime($stratTime,$endTime){

        // 字符串转数组
        $stratTimeArr = explode(' ',$stratTime);
        $endTimeArr =  explode(' ',$endTime);

        // 判断过滤一些特殊情况
        $this->checkTime($stratTimeArr[1]);
        $this->checkTime($endTimeArr[1]);

        // 获取请假时的时间戳
        $stattime = strtotime($stratTime);
        $endtime = strtotime($endTime);

        if ($endtime <= $stattime){
            $this->ajaxRes(-1,'结束时间 不能大于 开始时间');
        }

        // 拼接获取 请假的时间戳
        $StartDayTime = $stratTimeArr[0] .' 17:00:00';
        $endDayTime = $endTimeArr[0] .' 8:30:00';

        // 获取 请假当天 17:00 的时间戳;
        $leaveStartTime = strtotime($StartDayTime);

        // 获取 上班当天 8:30 的时间戳
        $leaveStopTime = strtotime($endDayTime);

        // 计算 请假当日 请假的时间
        $countStrat = $leaveStartTime - $stattime ;

        $contStartTime = $countStrat/3600;

        if ( $contStartTime > 4.5){
            $contStartTime  -= 0.5;
        }

        // 计算 到岗日请假了几个小时
        $contStopTime = ($endtime - $leaveStopTime)/3600;
        if ( $contStopTime > 4.5 ){
            $contStopTime  -= 0.5;
        }

        // 计算有几天
        // $stattime $endtime
        $countDay  = ($endtime - $stattime)/86400;

        $countDay = (int)($countDay);
        $countDay -= 1;

        $computationTime = ($countDay*8) + $contStopTime + $contStartTime;

        return $computationTime;
    }

    /**
     * @param $time
     * @return bool
     */
    public function checkTime($time){
        $arr = explode(':',$time);

        if (empty($arr)){
            $this->ajaxRes(-1,'输入时间有误');
            return false;
        }

        if ( ($arr[0] == 8 && $arr[1] == 00 ) || ($arr[0] == 17 && $arr[1] == 30 ) ){
            $this->ajaxRes(-1,'请选择 有效的工作时间');
            die();
        }

        return true;
    }

    /**
     * ajax 返回数据
     * @param $code
     * @param string $msg
     * @param int $type
     */
    public function ajaxRes($code,$msg = '',$type = 0){

        $arr = empty($type) ? $arr = array('code'=>$code,'message'=>$msg) : $code ;
        die(json_encode($arr));
    }

}