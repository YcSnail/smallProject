<?php
namespace Home\Controller;
use Think\Controller;
class IndexController extends Controller {
    public function index(){

        $this->display('ttt');
    }

    public function visit(){

        $this->display();
    }

    public function checkParams($params,$msg = ''){

        $param = trim($params);
        if (empty($param)){
            echo '请填写完整的信息'.$msg;
            die();
        }
        return $param;
    }

}