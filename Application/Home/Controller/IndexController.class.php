<?php
namespace Home\Controller;
use Think\Controller;
class IndexController extends Controller {

    public function aaa(){

        $name = '1234.zip';
        $path = YC_COMMON.'pdf/'.$name;

        $fliePath = $this->file($path);

        $array = array(
            'filePath'=> $fliePath
        );
        $this->assign($array);
        $this->display();
    }

    /**
     * 微信下单
     *
     */
    public function index(){

        $this->display('wct310');
    }

    public function getText(){
        $company = $this->checkEmpty($_POST['company'],'客户名称');
        $name = $this->checkEmpty($_POST['name'],'联系人');
        $phone = $this->checkEmpty($_POST['phone'],'联系电话',1);
        $data = $this->checkEmpty($_POST['data'],'送货日期',2);
        $prod = $this->checkEmpty($_POST['prod'],'产品');
        $qty = $this->checkEmpty($_POST['qty'],'数量');

        $openid = $this->openId;
        $params = [
            'code' => 'WCT310',
            'openid' => $openid,
            'company'=>$company,
            'name'=>$name,
            'phone'=>$phone,
            'data'=>$data,
            'prod'=>$prod,
            'qty'=>$qty,
        ];

        $this->ajaxRes(0,'提交成功');

    }

    /**
     * 检查变量
     * @param $var
     * @param $msg
     * @param int $type
     * @return mixed
     */
    public function checkEmpty($var,$msg,$type = 0){

        if (empty($var)){
            $this->ajaxRes(-1,$msg.'不能为空');
        }

        if (!empty($type)){

            # 检查 手机号
            if ($type == 1){
                if (!preg_match("/^1[34578]{1}\d{9}$/",$var)){
                    $this->ajaxRes(-1,'手机号不正确,请输入正确的手机号');
                }
            }
            #检查 日期
            if ($type == 2){
                if(!strtotime($var)){
                    $this->ajaxRes(-1,'日期格式不正确,请重新选择日期');
                }
            }
        }
        return $var;
    }

    /**
     * ajax请求返回
     * @param $code
     * @param $msg
     */
    public function ajaxRes($code,$msg){
        $arr = array(
            'code'=>$code,
            'msg'=>$msg,
        );
        die(json_encode($arr));
    }

    public function file($filePath){
        $http = 'http://';
        $http .= $_SERVER['HTTP_HOST']. $filePath;
        return $http;
    }
}