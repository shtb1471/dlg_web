$("#selectfiles").click(function () {
    $("#container input[type='file']").click();
    $("#container input[type='file']").change(function () {
        $("#postfiles").click();
    })
});
accessid = 't9zSHOdQ10x7QwLk';
accesskey = 'etpwepGdRxIx3wpn86C2CpSyhXxfE9';
// host = 'http://s.chengxinhutong.com/';
host = 'http://s.gongren.com/';

g_dirname = 'oddjob/img/';
g_object_name = '';
var policyText = {
    "expiration": "2020-01-01T12:00:00.000Z", //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
    "conditions": [
        ["content-length-range", 0, 1048576000] // 设置上传文件的大小限制
    ]
};
var policyBase64 = Base64.encode(JSON.stringify(policyText));
var bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {asBytes: true});
var signature = Crypto.util.bytesToBase64(bytes);

function random_string(len) {
    len = len || 32;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function calculate_object_name(filename,imgStyle) {
    if (filename.lastIndexOf('.') != -1) {
        suffix = filename.substring(filename.lastIndexOf('.'));
    }
    g_object_name = g_dirname + imgStyle + '/' + localStorage.getItem("userid") + '/'   + Crypto.MD5(random_string(10)) + suffix;
    return g_object_name;
}

function set_upload_param(up, filename, ret,imgStyle) {
    // g_object_name = g_dirname;
    if (filename != '') {
        if (filename.lastIndexOf('.') != -1) {
            suffix = filename.substring(filename.lastIndexOf('.'));
        }
        calculate_object_name(filename,imgStyle)
    }
    new_multipart_params = {
        'key': g_object_name,
        'policy': policyBase64,
        'OSSAccessKeyId': accessid,
        'success_action_status': '200', //让服务端返回200,不然，默认会返回204
        'signature': signature,
    };

    up.setOption({
        'url': host,
        'multipart_params': new_multipart_params
    });

    up.start();
}

var uploader = new plupload.Uploader({
    runtimes: 'html5,flash,silverlight,html4',
    browse_button: 'selectfiles',
    multi_selection: false,
    container: document.getElementById('container'),
    flash_swf_url: 'lib/plupload-2.1.2/js/Moxie.swf',
    silverlight_xap_url: 'lib/plupload-2.1.2/js/Moxie.xap',
    url: 'http://oss.aliyuncs.com',
    init: {
        PostInit: function () {
            document.getElementById('postfiles').onclick = function () {
                set_upload_param(uploader, '', false,$("#imgStyle").val());
                return false;
            };
        },
        FilesAdded: function (up, files) {
        },
        BeforeUpload: function (up, file) {
            set_upload_param(up, file.name, true,$("#imgStyle").val());
        },
        UploadProgress: function (up, file) {
        },
        FileUploaded: function (up, file, info) {
            if (info.status == 200) {
                var imgUrl=host + g_object_name;
                console.log(imgUrl);
                if($("#imgStyle").val()=='logo'){
                    $("#preview").attr("src",imgUrl);
                }
                if($("#imgStyle").val()=='license'){
                    $("#dlg-company-licence img").attr("src",imgUrl);
                }
                if($("#imgStyle").val()=='job'){
                    if($("#imgUrl img").length<3){
                        $("#imgUrl").append("<img src="+imgUrl+" style='width:120px;height:120px;'/>");
                        if($("#imgUrl img").length==3){
                            $("#chooseFile").css("background","#f3ba6e").removeAttr("onclick");
                        }
                    }else{
                        $("#chooseFile").css("background","#f3ba6e").removeAttr("onclick");
                        $("#errorMsg").html("最多只能上传3张图")
                    }
                }
            }
            else {
                console.log(info.response)
            }
        },
        Error: function (up, err) {
            document.getElementById('console').appendChild(document.createTextNode("\nError xml:" + err.response));
        }
    }
});
uploader.bind(//绑定文件上传事件，可以对文件类型以及文件数量进行验证
    'FilesAdded', function (up, files) {
        if (files.length > 3) {
            return false;
        } else {
            if (!/.(png|jpg|jpeg|bmp|gif)$/.test(files.name)) {
                return false;
            } else {
                uploader.splice(0, files.length - 1);
            }
        }

    });
uploader.init();
