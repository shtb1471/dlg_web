$(function () {
    $(".time").hunterTimePicker();
    getDatePicker('startDate', 'endDate');
})
AMap.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch'], function () {
    var autoOptions = {
        city: "北京", //城市，默认全国
        input: "detailAddress"//使用联想输入的input的id
    };
    autocomplete = new AMap.Autocomplete(autoOptions);
    AMap.event.addListener(autocomplete, "select", function (e) {
        //TODO 针对选中的poi实现自己的功能;

        if (e.poi.location != "") {
            if (e.poi.location.lng && e.poi.location.lat) {
                $("#x_coordinate").val(e.poi.location.lng);//保存经纬度信息
                $("#y_coordinate").val(e.poi.location.lat);

                getDetailAddress(e.poi.location.lng, e.poi.location.lat);
            }
        } else {
            console.log(e);
            alert("没有坐标")
        }

    });
});

function getDetailAddress(x, y) {
    $.get("http://restapi.amap.com/v3/geocode/regeo?key=deae182cee34787b59fc779ffe424c92&location=" + x+","+y + "&extensions=base&radius=0&batch=false&roadlevel=0", function (res) {
        //获取城镇code
        $("#towncode").val(res.regeocode.addressComponent.towncode);
        console.log(res.regeocode.addressComponent.towncode,"township")
     });
    AMap.service('AMap.Geocoder', function () {
        geocoder = new AMap.Geocoder({
            city: "010"
        });
        //逆地理编码
        var lnglatXY = [x, y];
        geocoder.getAddress(lnglatXY, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                console.log("高德地图",JSON.stringify(result))
                //将返回信息保存在input里
                $("#addressInfo").attr("value", JSON.stringify(result));
                var provinceName = result.regeocode.addressComponent.province;
                $.get("http://restapi.amap.com/v3/config/district?key=deae182cee34787b59fc779ffe424c92&keywords=" + provinceName + "&subdistrict=0&extensions=base", function (res) {
                    var provinceId = res.districts[0].adcode;//省id
                    $("#provinceId").val(provinceId);
                    console.log("得到省id=== ", $("#provinceId").val());
                    console.log("res地址：",res)
                });
            } else {
                //获取地址失败
            }
        });

    })
}

$("#accountForm span").click(function () {
    addActive(this);
    var index = $(this).index();
    switch (index) {
        case 1:
            $("#jijianShow").hide();
            $("#jishiShow").show();
            $("#workTime").show();
            break;
        case 2:
            $("#jishiShow").hide();
            $("#workTime").hide();
            $("#jijianShow").show();
            break;
        default:
            $("#jishiShow").show();
            $("#jijianShow").show();
            $("#workTime").show();
            break;
    }
})

//单次单选弹框
function addTimeModal() {
    $("#shiftName,#startTime,#endTime").val("");
    $("#time_modal").show();
}

//发布零工页面企业查询
function refreshAddress() {
    /**
     * 企业地址查询
     */
    $.ajax({
        url: url + '/user/' + userid + '/address/query',
        type: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: {access_token: access_token, clienttype: 2, page_index: 0, page_size: 5},
        timeout: '3000',
        cache: 'false',
        error: function () {
            alert("报错了");
        },
        success: function (data) {
            var result = "";
            if (data.status == 200 && data.body.code == 'SUCCESS') {
                if (data.body.data.addrlist.length > 0) {
                    var i = 0;
                    for (i; i < data.body.data.addrlist.length; i++) {

                        result += "<div class=\"dlg-row-5\" onclick=\"changeActive(this)\">";
                        if (i == 0) {
                            result += "<div class=\"active\">";
                        } else {
                            result += "<div>";
                        }
                        result += "<span class=\"dlg-address-choice\">";
                        result += "</span>";
                        var work_address = "";
                        if (data.body.data.addrlist[i].work_address.length > 18) {
                            work_address = data.body.data.addrlist[i].work_address.substr(0, 18) + "...";
                        } else {
                            work_address = data.body.data.addrlist[i].work_address;
                        }
                        result += "<span class=\"dlg-address-txt\" " +
                            "title=\"" + data.body.data.addrlist[i].work_address + "\"" +
                            "data-area_id=\"" + data.body.data.addrlist[i].area_id + "\"" +
                            "data-area_name=\"" + data.body.data.addrlist[i].area_name + "\"" +
                            "data-city_id=\"" + data.body.data.addrlist[i].city_id + "\"" +
                            "data-city_name=\"" + data.body.data.addrlist[i].city_name + "\"" +
                            "data-detail_address=\"" + data.body.data.addrlist[i].detail_address + "\"" +
                            "data-id=\"" + data.body.data.addrlist[i].id + "\"" +
                            "data-privince_id=\"" + data.body.data.addrlist[i].privince_id + "\"" +
                            "data-province_name=\"" + data.body.data.addrlist[i].province_name + "\"" +
                            "data-village_id=\"" + data.body.data.addrlist[i].village_id + "\"" +
                            "data-village_name=\"" + data.body.data.addrlist[i].village_name + "\"" +
                            "data-work_address=\"" + data.body.data.addrlist[i].work_address + "\"" +
                            "data-x_coordinate=\"" + data.body.data.addrlist[i].x_coordinate + "\"" +
                            "data-y_coordinate=\"" + data.body.data.addrlist[i].y_coordinate + "\"" +
                            ">"
                            + work_address + "</span>" +
                            "</div>";
                        result += "</div>";

                    }

                    console.log("result",result)
                    $("#dlgAddress").html(result);
                }
            }
        }, error: function (res) {
            console.log("查询地址发生错误 ", res)
        }
    })
}

//弹出地址添加model
function showAddressModal() {
    $("#detailAddress").val("");
    $("#address_modal").show();

    var user_id = localStorage.getItem("userid");
    /**
     * 企业地址查询
     */
    $.ajax({
        url: url + '/user/' + user_id + '/address/query',
        type: 'GET',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        data: {access_token: access_token, clienttype: 2, page_index: 0, page_size: 5},
        timeout: '3000',
        cache: 'false',
        error: function (jqXHR, textStatus, errorThrown) {
            /*弹出jqXHR对象的信息*/
            alert(jqXHR.responseText);
            alert(jqXHR.status);
            alert(jqXHR.readyState);
            alert(jqXHR.statusText);
            /*弹出其他两个参数的信息*/
            alert(textStatus);
            alert(errorThrown);
        },
        success: function (data) {
            var result = "";
            if (data.status == 200 && data.body.code == 'SUCCESS') {
                if (data.body.data.addrlist.length > 0) {
                    var i = 0;
                    for (i; i < data.body.data.addrlist.length; i++) {

                        result += "<tr>";
                        result += " <td>" + data.body.data.addrlist[i].work_address + "</td>";
                        result += " <td>";
                        result += "<button type=\"button\" value=\"" + data.body.data.addrlist[i].id + "\" class=\"btn btn-default mini-size\" onclick=\"deleteAdress(this.value)\">删除</button>";
                        result += " </td>";
                        result += "</tr>";
                    }
                } else {
                    result += "<tr>"
                        + "<td colspan=\"2\">"
                        + "<div class=\"dlg-row add-padding-15\">"
                        + "<h3 class='font-16 text-center' style='color: red;'>"
                        + "<img class='dlg-no-list-img' src='./images/no-list.png'/>"
                        + "</h3>"
                        + "</td>"
                        + "</tr>";
                }
                $("#address").html(result);
            }
        }, error: function (res) {
            console.log("查询地址发生错误 ", res)
        }
    })
}

//删除地址
function deleteAdress(id) {
    if (id != null && id != "") {
        $.ajax({
            url: url + '/user/' + userid + '/address/delete/' + id,
            type: 'GET',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: {access_token: access_token},
            timeout: '1000',
            cache: 'false',
            success: function (data) {
                if (data.status == 200 && data.body.code == 'SUCCESS') {
                    alert("删除地址成功");
                    $("#address_modal").hide();
                    refreshAddress();
                }
            }
        })
    } else {
        alert("地址id为空");
    }

}


function addAddressModal() {
    var detailAddress = $("#detailAddress");
    var doorNumber = $("#doorNumber").val();
    if (detailAddress.val() == "") {
        detailAddress.css("border-color", "red");
        $("#address_modal").show();
        return false;
    } else {
        //保存地址信息
        var addressInfo = $("#addressInfo").val();
        var dataFormat = JSON.parse(addressInfo);
        var x_coordinate = $("#x_coordinate").val();
        var y_coordinate = $("#y_coordinate").val();

        var city = dataFormat.regeocode.addressComponent.city;
        var province = dataFormat.regeocode.addressComponent.province;
        if (province != null && province != "") {
            if (province == '上海市') {
                city = "上海市";
            } else if (province == '北京市') {
                city = "北京市";
            } else if (province == '天津市') {
                city = "天津市"
            } else if (province == '重庆市') {
                city = "重庆市"
            } else {
                city = city;
            }
        }
        var detailAddressStr = dataFormat.regeocode.formattedAddress;
        if (doorNumber != "" && doorNumber != null) {
            detailAddressStr += doorNumber;
        }
        var province_id = $("#provinceId").val();
        console.log("添加省id=", province_id);
        $.ajax({
            url: url + '/user/' + userid + '/address/save',
            type: 'post',
            data: {
                access_token: access_token,
                clienttype: 2,
                x_coordinate: x_coordinate,
                y_coordinate: y_coordinate,
                province_name: dataFormat.regeocode.addressComponent.province,
                city_name: city,
                area_name: dataFormat.regeocode.addressComponent.district,
                village_name: dataFormat.regeocode.addressComponent.township,
                work_address: detailAddressStr,
                area_id: dataFormat.regeocode.addressComponent.adcode,
                city_id: dataFormat.regeocode.addressComponent.citycode,
                privince_id: province_id
            },
            dataType: 'json',
            timeout: '3000',
            cache: 'false',
            success: function (data) {
                if (data.status == 200 && data.body.code == 'SUCCESS') {
                    alert("地址添加成功");
                    $("#address_modal").hide();
                    $("#doorNumber").val("");
                    refreshAddress();
                } else {
                    console.log(data.status + data.body.code);
                }
            }, error: function (res) {
                console.log("发生错误", res);
            }
        })
        detailAddress.css("border-color", "#eaeaea");
    }
};

function addTimeR() {
    if ($("#shiftName").val() == "") {
        $("#shiftName").focus().css("border-color", "red");
        $("#shiftName").next().html("请输入班次名称");
        $("#time_modal").show();
        return false;
    } else {
        inputValueOperation($("#shiftName"));
    }
    if ($("#startTime").val() == "") {
        $("#startTime").focus().css("border-color", "red");
        $("#startTime").next().next().html("请输入起始时间");
        $("#time_modal").show();
        return false;
    } else {
        $("#startTime").css("border-color", "#eaeaea");
        $("#startTime").next().next().html("");
    }
    if ($("#endTime").val() == "") {
        $("#endTime").focus().css("border-color", "red");
        $("#endTime").next().html("请输入结束时间");
        $("#time_modal").show();
        return false;
    } else {
        inputValueOperation($("#endTime"));
    }
    var startTime = $("#startTime").val();
    var endTime = $("#endTime").val();
    var htm = "";
    if ($("#dlg-time-range").find(".dlg-time-box").length > 3) {
        alert("请先新增再删除")
        return false;
    } else {
        htm = '<span class="dlg-time-box">\n' +
            '<i class="dlg-time-close" onclick="closeTime(this)"></i>\n' +
            '<input type="text" readonly data-banci="' + $("#shiftName").val() + '" value="' + startTime + "-" + endTime + '"/>\n' +
            '</span>'
        $("#dlg-time-range").append(htm);
    }

    var endDate = $("#endDate").val();
    var endTimeStr = endDate + " " + endTime;

    var currentdate = getCurrentdate();
    var currentDateLong = new Date(currentdate.replace(new RegExp("-", "gm"), "/")).getTime();
    var inputDaateLong = new Date(endTimeStr.replace(new RegExp("-", "gm"), "/")).getTime();

    console.log("系统时间戳 =", currentDateLong);
    console.log("输入时间戳=", inputDaateLong);

    if (inputDaateLong < currentDateLong) {
        $("#time_modal").hide();
        $("#startDate").focus().css("border-color", "red");
        $("#endDate").next().html("干活时间必须大于当前时间，请重新选择");
        return false;
    }else{
        $("#startDate").css("border-color", "#eaeaea");
        $("#endDate").next().html("");
    }

    $("#time_modal").hide();
    $("#time_modal").hide();
}

// 发布零工
function regxValue() {
    if ($("#taskName").val() == "") {
        $("#taskName").focus().css("border-color", "red");
        $("#taskName").next().html("请输入零工名称");
        return false;
    } else {
        inputValueOperation($("#taskName"));
    }
    if ($("#taskType").find("option:selected").val() == "" || $("#taskType").find("option:selected").val() == 0) {
        $("#taskType").css("border-color", "red");
        $("#taskType").next().html("请选择零工类型");
        return false;
    } else {
        inputValueOperation($("#taskType"));
    }
    if ($("#taskPersonNum").val() == "") {
        $("#taskPersonNum").focus().css("border-color", "red");
        $("#taskPersonNum").next().html("请输入雇佣人数");
        return false;
    } else {
        inputValueOperation($("#taskPersonNum"));
    }
    //结算信息
    switch ($("#accountForm").find("span.active").attr("data-id")) {
        case "1":
            if ($("#price_wage").val() == "") {
                $("#price_wage").focus().css("border-color", "red");
                $("#jishiShow").find("span").html("请输入固定报酬");
                return false;
            } else {
                $("#price_wage").css("border-color", "#eaeaea");
                $("#jishiShow").find("span").html("");
            }
            break;
        case "2":
            if ($("#price_commission").val() == "") {
                $("#price_commission").focus().css("border-color", "red");
                $("#jijianShow").find("span").html("请输入提成");
                return false;
            } else {
                $("#price_commission").css("border-color", "#eaeaea");
                $("#jijianShow").find("span").html("");
            }
            break;
        default:
            if ($("#price_wage").val() == "" || $("#price_commission").val() == "") {
                if ($("#price_wage").val() == "") {
                    $("#price_wage").focus().css("border-color", "red");
                    $("#jishiShow").find("span").html("请输入固定报酬");
                    return false;
                } else if ($("#price_commission").val() == "") {
                    $("#price_wage").css("border-color", "#eaeaea");
                    $("#jishiShow").find("span").html("");
                    $("#price_commission").focus().css("border-color", "red");
                    $("#jijianShow").find("span").html("请输入提成");
                    return false;
                }
            } else {
                $("#price_wage").css("border-color", "#eaeaea");
                $("#jishiShow").find("span").html("");
                $("#price_commission").css("border-color", "#eaeaea");
                $("#jijianShow").find("span").html("");
            }
            break;
    }
    // 干活时间地点
    if ($("#startDate").val() == "") {
        $("#startDate").focus().css("border-color", "red");
        $("#endDate").next().html("请输入开始日期");
        return false;
    } else {
        var endDate = $("#endDate").val();
        var endTime = $("#endTime").val();
        var endTimeStr = endDate + " " + endTime;

        var currentdate = getCurrentdate();
        var currentDateLong = new Date(currentdate.replace(new RegExp("-", "gm"), "/")).getTime();
        var inputDaateLong = new Date(endTimeStr.replace(new RegExp("-", "gm"), "/")).getTime();

        console.log("系统时间戳 =", currentDateLong);
        console.log("输入时间戳=", inputDaateLong);

        if (inputDaateLong < currentDateLong) {
            $("#startDate").focus().css("border-color", "red");
            $("#endDate").next().html("干活时间必须大于当前时间，请重新选择");
            return false;
        }
        $("#endDate").next().html("");
        $("#startDate").css("border-color", "#eaeaea");
    }
    if ($("#endDate").val() == "") {
        $("#endDate").focus().css("border-color", "red");
        $("#endDate").next().html("请输入结束日期");
        return false;
    } else {
        $("#endDate").next().html("");
        $("#endDate").css("border-color", "#eaeaea");
    }
    if ($("#dlg-time-range").find("input[type='text']").length == 0) {
        $("#workTime").find("span.dlg-red-color").html("请添加干活时间");
        return false;
    } else {
        $("#workTime").find("span.dlg-red-color").html("");
    }
    if ($("#dlgAddress").find("div.active").length == 0) {
        $("#dlgAddress").find("span.dlg-red-color").html("请添加或选择工作地点");
        return false;
    } else {
        $("#dlgAddress").find("span.dlg-red-color").html("");
    }
    if ($("#task_description").val() == "") {
        $("#task_description").focus().css("border-color", "red");
        $("#task_description").next().next().html("要求描述为必填");
        return false;
    } else {
        $("#task_description").next().next().html("");
        $("#task_description").css("border-color", "#eaeaea");
    }
    // if($("#imgUrl").find("img").length==0){
    //     $("#errorMsg").html("请添加现场照片");
    //     return false;
    // }else{
    //     $("#errorMsg").html("");
    // }
    if ($("#username").val() == "") {
        $("#username").focus().css("border-color", "red");
        $("#username").next().html("请输入验收人姓名");
        return false;
    } else {
        inputValueOperation($("#username"));
    }
    if ($("#phone").val() == "" || !/^1[3|4|5|7|8][0-9]{9}$/.test($("#phone").val())) {
        $("#phone").focus().css("border-color", "red");
        $("#phone").next().html("请输入正确手机号");
        return false;
    } else {
        inputValueOperation($("#phone"));
    }
    if ($("#email").val() == "" || !/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test($("#email").val())) {
        $("#email").focus().css("border-color", "red");
        $("#email").next().html("请输入有效的邮箱");
        return false;
    } else {
        inputValueOperation($("#email"));
    }
    return true;
}

function inputValueOperation(obj) {
    $(obj).next().html("");
    $(obj).css("border-color", "#eaeaea");
}
function inputValueOperationNext(obj) {
    $(obj).next().next().html("");
    $(obj).css("border-color", "#eaeaea");
}
function releaseOddJob() {
    if (!regxValue()) {
        return false;
    } else {
        //企业id
        var user_id = localStorage.getItem("userid");
        //用户token
        var access_token = localStorage.getItem("access_token");
        //零工名称
        var task_title = $("#taskName").val();
        //零工类型
        var post_type = $("#taskType option:selected").val();

        //零工类型名称
        var post_type_name = $('#taskType option:selected').text();
        //招聘人数
        var recruit_number = $("#taskPersonNum").val();

        //性别
        var sex = $('input[name="sex"]:checked').val();
        //计时 计件 计时+计件
        var cost_accounting_type = $("#accountForm").find("span.active").attr("data-id");

        //计时价格
        var price_wage = "";

        //计时类型
        var job_meter_unit_wage = "";

        //提成价格
        var price_commission = "";

        // 计件类型
        var job_meter_unit_commission = "";
        if ("1" == cost_accounting_type) {
            //计时
            price_wage = $("#price_wage").val();
            job_meter_unit_wage = $("#job_meter_unit_wage").val();

            price_commission = "";
            job_meter_unit_commission = "";

        } else if ("2" == cost_accounting_type) {
            //计件
            price_wage = "";
            job_meter_unit_wage = "";

            price_commission = $("#price_commission").val();
            job_meter_unit_commission = $("#job_meter_unit_commission").val();
        } else if ("3" == cost_accounting_type) {
            //计时 + 计件
            price_wage = $("#price_wage").val();
            job_meter_unit_wage = $("#job_meter_unit_wage").val();
            price_commission = $("#price_commission").val();
            job_meter_unit_commission = $("#job_meter_unit_commission").val();
        }
        //干活日期
        var start_date = $("#startDate").val();
        //结束日期
        var end_date = $("#endDate").val();
        //干活时间
        var job_time = [];
        if ("2" == cost_accounting_type) {
            job_time = [];
        } else {
            var timeInput = $("#dlg-time-range").find("input[type='text']");
            timeInput.each(function (index, input) {
                var banci = $(input).attr("data-banci");
                if (banci == 'undefined') {
                    banci = "";
                }
                var jsonData = {
                    start_time: $(input).val().split("-")[0] + ":00",
                    end_time: $(input).val().split("-")[1] + ":00",
                    work_shift: banci

                };
                job_time.push(jsonData);
            })
        }

        //零工描述
        var task_description = $("#task_description").val();
        //零工图片
        var imgsUrl = [];
        if ($("#imgUrl").find("img").length > 0) {
            $("#imgUrl").find("img").each(function (index, img) {

                var src = img.src.substr(21, img.src.length);
                console.log("src= ", src);
                var objImg = {
                    url: src
                }
                imgsUrl.push(objImg);
            })
        } else {
            imgsUrl = [];
        }
        //验收人
        var checker = $("#username").val();
        //验收联系电话
        var checker_phone = $("#phone").val();
        //验收人邮箱
        var checker_email = $("#email").val();
        var is_allow_agent = "0";
        var is_buy_insurance = "0";
        //是否需要代理商服务
        if ($("#dlg-server").prop("checked") == true) {
            is_allow_agent = 1;
        } else {
            is_allow_agent = 0;
        }
        //是否买保险
        if ($("#dlg-baoxian").prop("checked") == true) {
            is_buy_insurance = 1;
        } else {
            is_buy_insurance = 0;
        }
        //得到地址相关信息
        var work_address = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-work_address");
        var x_coordinate = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-x_coordinate");
        var y_coordinate = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-y_coordinate");
        var province_id = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-privince_id");
        var province_name = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-province_name");
        var city_id = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-city_id");
        var city_name = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-city_name");
        var area_id = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-area_id");
        var area_name = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-area_name");
        var village_id = $("#towncode").val();
        var village_name = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-village_name");
        //数据组装
        var dataJson = {
            "userid": user_id,
            "clienttype": "2",
            "access_token": access_token,
            "task_title": task_title,
            "post_type": post_type,
            "post_type_name": post_type_name,
            "recruit_number": Number(recruit_number),
            "sex": Number(sex),
            "cost_accounting_type": Number(cost_accounting_type),
            "start_date": start_date,
            "end_date": end_date,
            "job_time": job_time,
            "work_address": work_address,
            "x_coordinate": Number(x_coordinate),
            "y_coordinate": Number(y_coordinate),
            "task_description": task_description,
            "job_requirement": "",
            "is_allow_agent": is_allow_agent,
            "province_id": province_id,
            "province_name": province_name,
            "city_id": city_id,
            "city_name": city_name,
            "area_id": area_id,
            "area_name": area_name,
            "village_id": village_id,
            "village_name": village_name,
            "checker": checker,
            "checker_phone": checker_phone,
            "checker_email": checker_email,
            "job_imgs": imgsUrl,
            //"obey_allocate": 1,
            "is_debug": 0,
            //"remark": "",
            //"is_import": 0,
            "is_buy_insurance": is_buy_insurance,
            //"is_transfer_check": 0
        };
        if (cost_accounting_type == "1" || cost_accounting_type == 1) {
            dataJson.price_wage = Number(price_wage);
            dataJson.job_meter_unit_wage = Number(job_meter_unit_wage);
            dataJson.job_time = job_time;
        } else if (cost_accounting_type == "2" || cost_accounting_type == 2) {
            dataJson.price_commission = Number(price_commission);
            dataJson.job_meter_unit_commission = Number(job_meter_unit_commission);
        } else if (cost_accounting_type == "3" || cost_accounting_type == 3) {
            dataJson.price_wage = Number(price_wage);
            dataJson.job_meter_unit_wage = Number(job_meter_unit_wage);
            dataJson.price_commission = Number(price_commission);
            dataJson.job_meter_unit_commission = Number(job_meter_unit_commission);
            dataJson.job_time = job_time;
        }
        console.log(dataJson, "dataJson");
         $.ajax({
             url: url + '/job/create',
             type: 'post',
             contentType: "application/json; charset=utf-8",
             data: JSON.stringify(dataJson),
             dataType: 'json',
             timeout: '1000',
             cache: 'false',
             success: function (data) {
                 console.log(data)
                 if (data.body.code = "SUCCESS" && data.body.msg == "成功") {
                     jumpPage('./linggongguanli/quanbulinggong.html', 'rightPart');
                 }
             }
         })
    }
}

//根据jobid查询详情
function showJobInfo() {
    var jobId = localStorage.getItem("jobid");
    localStorage.setItem("jobid", "");
    if (jobId != null && jobId != "") {

        //隐藏发布零工按钮
        $("#releaseOddJob").hide();
        $("#updateOddJob").show();

        $.ajax({
            url: url + '/job/' + jobId,
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            data: '',
            dataType: 'json',
            timeout: '1000',
            cache: 'false',
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest);
                alert(textStatus);
                alert(errorThrown);
            },
            success: function (data) {
                console.log("详情data= ", data);
                if (data.body.code = "SUCCESS" && data.body.msg == "成功") {
                    //保存jobid
                    $("#jobId").val(data.body.data.id);

                    //设置省id
                    $("#provinceId").val(data.body.data.province_id);
                    //零工名称
                    $("#taskName").val(data.body.data.task_title);
                    //零工类型
                    $("#taskType option[value='" + data.body.data.post_type + "']").attr("selected", true);
                    //招聘人数
                    $("#taskPersonNum").val(data.body.data.recruit_number);
                    //性别
                    $(":radio[name='sex'][value='" + data.body.data.sex + "']").attr("checked", "checked");
                    //计时 计件 计时+计件  类型
                    $("#accountForm span").each(function (index, tag) {
                        if ($(tag).attr("data-id") == data.body.data.cost_accounting_type) {
                            $("#accountForm span").removeClass("active");
                            $(tag).addClass("active");
                        }
                    })
                    var job_meter_unit_wage = data.body.data.job_meter_unit_wage;

                    //计时 计件 计时+计件  名称
                    var job_meter_unit_wage_name = data.body.data.job_meter_unit_wage_name;

                    //计件类型
                    var job_meter_unit_commission = data.body.data.job_meter_unit_commission;

                    //计件类型 名称
                    var job_meter_unit_commission = data.body.data.job_meter_unit_commission_name;

                    //固定报酬
                    $("#price_wage").val(data.body.data.price_wage);
                    //提成价格
                    $("#price_commission").val(data.body.data.price_commission);
                    if (data.body.data.job_meter_unit_commission != "") {
                        $("#job_meter_unit_commission option[value='" + data.body.data.job_meter_unit_commission + "']").attr("selected", true);
                    } else {
                        $("#jijianShow").hide();
                    }
                    if (data.body.data.job_meter_unit_wage != "") {
                        $("#job_meter_unit_wage option[value='" + data.body.data.job_meter_unit_wage + "']").attr("selected", true);
                    } else {
                        $("#jishiShow").hide();
                    }
                    //开始时间
                    var start_date = data.body.data.start_date;
                    $("#startDate").val(start_date);
                    //结束时间
                    var end_date = data.body.data.end_date;
                    $("#endDate").val(end_date);
                    //时间段
                    var jobTime = data.body.data.job_time;
                    var html = "";
                    console.log(typeof (jobTime), "jobTime")
                    jobTime.forEach(function (time) {
                        html += " <span class=\"dlg-time-box\">\n" +
                            "<i class=\"dlg-time-close\" onclick=\"closeTime(this)\"></i>\n" +
                            "<input type=\"text\" readonly=\"\" data-banci=\"" + time.work_shift + "\" value=\"" + time.start_time.substr(0, 5) + '-' + time.end_time.substr(0, 5) + "\">\n" +
                            "</span>"
                    });
                    $("#dlg-time-range").html("").append(html);
                    //地址
                    $("#dlgAddress span.dlg-address-txt").each(function (index, addressDetail) {
                        if ($(addressDetail).attr("data-work_address").trim() == $.trim(data.body.data.work_address)) {
                            $("#dlgAddress div.dlg-row-5").find("div").removeClass("active");
                            $(addressDetail).parent().addClass("active");
                        }
                        ;
                    })
                    //零工描述
                    $("#task_description").val(data.body.data.task_description);
                    //图片
                    var imgHtml = "";
                    data.body.data.job_imgs.forEach(function (img) {
                        imgHtml += "<img src='" + img.url + "' style=\"width:120px;height:120px;\"/>";
                    })
                    $("#imgUrl").html("").append(imgHtml);
                    //验收人
                    $("#username").val(data.body.data.checker);

                    //验收联系电话
                    $("#phone").val(data.body.data.checker_phone);

                    //验收人邮箱
                    $("#email").val(data.body.data.checker_email);

                    //是否购买保险
                    var is_buy_insurance = data.body.data.is_buy_insurance;
                    if (is_buy_insurance == 1) {//选中
                        $("input[name='dlg-baoxian']").attr("checked", "checked");
                    }
                    //是否是代理商服务
                    var is_allow_agent = data.body.data.is_allow_agent;
                    if (is_allow_agent == 1) {//选中
                        $("input[name='dlg-server']").attr("checked", "checked");
                    }
                }
            }
        })

    }

}

//修改零工
function updateOddJob() {
    var jobId = $("#jobId").val();
    if (jobId == null || jobId == "") {
        alert("找不到该零工id");
        return false;
    }
    if (!regxValue()) {
        return false;
    } else {
        // //企业id
        // var user_id = localStorage.getItem("userid");
        // //用户token
        // var access_token = localStorage.getItem("access_token");
        //零工名称
        var task_title = $("#taskName").val();
        //零工类型
        var post_type = $("#taskType option:selected").val();
        //零工类型名称
        var post_type_name = $('#taskType option:selected').text();
        //招聘人数
        var recruit_number = $("#taskPersonNum").val();

        //性别
        var sex = $('input[name="sex"]:checked').val();
        //计时 计件 计时+计件
        var cost_accounting_type = $("#accountForm").find("span.active").attr("data-id");

        //计时价格
        var price_wage = "";

        //计时类型
        var job_meter_unit_wage = "";

        //提成价格
        var price_commission = "";

        // 计件类型
        var job_meter_unit_commission = "";
        if ("1" == cost_accounting_type) {
            //计时
            price_wage = $("#price_wage").val();
            job_meter_unit_wage = $("#job_meter_unit_wage").val();

            price_commission = "";
            job_meter_unit_commission = "";

        } else if ("2" == cost_accounting_type) {
            //计件
            price_wage = "";
            job_meter_unit_wage = "";

            price_commission = $("#price_commission").val();
            job_meter_unit_commission = $("#job_meter_unit_commission").val();
        } else if ("3" == cost_accounting_type) {
            //计时 + 计件
            price_wage = $("#price_wage").val();
            job_meter_unit_wage = $("#job_meter_unit_wage").val();
            price_commission = $("#price_commission").val();
            job_meter_unit_commission = $("#job_meter_unit_commission").val();
        }
        //干活日期
        var start_date = $("#startDate").val();
        //结束日期
        var end_date = $("#endDate").val();
        //干活时间
        var job_time = [];
        if ("2" == cost_accounting_type) {
            job_time = [];
        } else {
            var timeInput = $("#dlg-time-range").find("input[type='text']");
            timeInput.each(function (index, input) {
                var banci = $(input).attr("data-banci");
                if (banci == 'undefined') {
                    banci = "";
                }
                var jsonData = {
                    start_time: $(input).val().split("-")[0] + ":00",
                    end_time: $(input).val().split("-")[1] + ":00",
                    work_shift: banci

                };
                job_time.push(jsonData);
            })
        }

        //零工描述
        var task_description = $("#task_description").val();
        //零工图片
        var imgsUrl = [];
        if ($("#imgUrl").find("img").length > 0) {
            $("#imgUrl").find("img").each(function (index, img) {

                var src = img.src.substr(21, img.src.length);
                console.log("src= ", src);
                var objImg = {
                    url: src
                }
                imgsUrl.push(objImg);
            })
        } else {
            imgsUrl = [];
        }
        //验收人
        var checker = $("#username").val();
        //验收联系电话
        var checker_phone = $("#phone").val();
        //验收人邮箱
        var checker_email = $("#email").val();
        var is_allow_agent = "0";
        var is_buy_insurance = "0";
        //是否需要代理商服务
        if ($("#dlg-server").prop("checked") == true) {
            is_allow_agent = 1;
        } else {
            is_allow_agent = 0;
        }
        //是否买保险
        if ($("#dlg-baoxian").prop("checked") == true) {
            is_buy_insurance = 1;
        } else {
            is_buy_insurance = 0;
        }
        //得到地址相关信息
        var work_address = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-work_address");
        var x_coordinate = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-x_coordinate");
        var y_coordinate = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-y_coordinate");
        var province_id = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-privince_id");
        var province_name = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-province_name");
        var city_id = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-city_id");
        var city_name = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-city_name");
        var area_id = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-area_id");
        var area_name = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-area_name");
        var village_id = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-village_id");
        var village_name = $("#dlgAddress").find("div.active span.dlg-address-txt").attr("data-village_name");
        console.log("province_id",province_id)
        console.log("city_id",city_id)
        console.log("area_id",area_id)
        console.log("village_id",village_id)

        //数据组装
        var dataJson = {
            // "userid": user_id,
            // "clienttype": "2",
            // "access_token": access_token,
            "task_title": task_title,
            "post_type": post_type,
            "post_type_name": post_type_name,
            "recruit_number": Number(recruit_number),
            "sex": Number(sex),
            // "cost_accounting_type": Number(cost_accounting_type),
            "start_date": start_date,
            "end_date": end_date,
            "job_time": job_time,
            "work_address": work_address,
            "x_coordinate": Number(x_coordinate),
            "y_coordinate": Number(y_coordinate),
            "task_description": task_description,
            "job_requirement": "",
            "is_allow_agent": is_allow_agent,
            "province_id": province_id,
            "province_name": province_name,
            "city_id": city_id,
            "city_name": city_name,
            "area_id": area_id,
            "area_name": area_name,
            "village_id": village_id,
            "village_name": village_name,
            "checker": checker,
            "checker_phone": checker_phone,
            "checker_email": checker_email,
            "job_imgs": imgsUrl,
            //"obey_allocate": 1,
            // "is_debug": 0,
            //"remark": "",
            //"is_import": 0,
            "is_buy_insurance": is_buy_insurance,
            //"is_transfer_check": 0
        };
        if (cost_accounting_type == "1" || cost_accounting_type == 1) {
            dataJson.price_wage = Number(price_wage);
            dataJson.job_meter_unit_wage = Number(job_meter_unit_wage);
            dataJson.job_time = job_time;
        } else if (cost_accounting_type == "2" || cost_accounting_type == 2) {
            dataJson.price_commission = Number(price_commission);
            dataJson.job_meter_unit_commission = Number(job_meter_unit_commission);
        } else if (cost_accounting_type == "3" || cost_accounting_type == 3) {
            dataJson.price_wage = Number(price_wage);
            dataJson.job_meter_unit_wage = Number(job_meter_unit_wage);
            dataJson.price_commission = Number(price_commission);
            dataJson.job_meter_unit_commission = Number(job_meter_unit_commission);
            dataJson.job_time = job_time;
        }
        console.log(dataJson, "dataJson");

        $.ajax({
            url: url + '/job/' + jobId + '/update',
            type: 'post',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataJson),
            dataType: 'json',
            timeout: '2000',
            cache: 'false',
            success: function (data) {
                console.log("修改零工jsdata= ",data);
                if (data.body.code = "SUCCESS" && data.body.msg == "成功") {
                    alert("修改零工成功");
                    jumpPage('./linggongguanli/quanbulinggong.html', 'rightPart');
                }
            }
        })
    }
}

// 图片上传
function chooseFile() {
    $("#selectfiles").click();
}

//获取系统当前时间
function getCurrentdate() {
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1;
    var today = nowDate.getDate();
    var hours = nowDate.getHours();
    var minutes = nowDate.getMinutes();

    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (today >= 1 && today <= 9) {
        today = "0" + today;
    }
    var currentdate = year + "-" + month + "-" + today + " " + hours + ":" + minutes;
    return currentdate;
}