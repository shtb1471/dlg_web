(function ($) {
    $.hunterTimePicker = function (box, options) {
        var dates = {
            hour: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
            minute: ['00', '30']
        };

        var box = $(box);
        var template = $('<div class="Hunter-time-picker" id="Hunter_time_picker"><div class="Hunter-wrap"><ul class="Hunter-wrap" id="Hunter_time_wrap"></ul></div></div>');

        var time_wrap = $('#Hunter_time_wrap', template);

        $(document).click(function () {
            template.remove();
        });
        var htmlArray = [];
        box.click(function (event) {
            event.preventDefault();
            event.stopPropagation();
            $('.Hunter-time-picker').remove();
            var _this = $(this);
            var offset = _this.offset();
            var top = offset.top + _this.outerHeight() + 15;
            template.css({
                /*'left': offset.left,
                 'top': top*/
                'left': offset.left,
                'top': top
            });
            htmlArray.push(event.currentTarget.innerHTML)
            buildTimePicker(htmlArray);
            $('body').append(template);

            $('.Hunter-time-picker').click(function (event) {
                event.preventDefault();
                event.stopPropagation();
            });
        });

        function buildTimePicker(obj) {
            buildHourTpl();
            hourEvent();
            minuteEvent();
            cleanBtnEvent(obj);
        };

        function buildHourTpl() {
            var hour_html = '<p>小时</p>';
            for (var i = 0; i < dates.hour.length; i++) {
                var temp = box.val().split(":")[0];
                if (dates.hour[i] == temp) {
                    hour_html += '<li class="Hunter-hour active" data-hour="' + dates.hour[i] + '"><ul class="Hunter-minute-wrap"></ul><div class="Hunter-hour-name">' + dates.hour[i] + '</div></li>';
                } else {
                    hour_html += '<li class="Hunter-hour" data-hour="' + dates.hour[i] + '"><ul class="Hunter-minute-wrap"></ul><div class="Hunter-hour-name">' + dates.hour[i] + '</div></li>';
                }
            }

            hour_html += '<li class="Hunter-clean"><input type="button" class="Hunter-clean-btn" id="Hunter_clean_btn" value="清 空"></li>'

            time_wrap.html(hour_html);
        };

        function buildMinuteTpl(cur_time) {
            var offset = cur_time.offset();
            var poi = cur_time.position();
            var minute_html = '<p>分钟</p>';
            var temp = box.val().split(":")[1];
            for (var j = 0; j < dates.minute.length; j++) {
                if (dates.minute[j] == temp) {
                    minute_html += '<li class="Hunter-minute active" data-minute="' + dates.minute[j] + '">' + dates.minute[j] + '</li>';
                } else {
                    minute_html += '<li class="Hunter-minute" data-minute="' + dates.minute[j] + '">' + dates.minute[j] + '</li>';
                }
            }
            cur_time.find('.Hunter-minute-wrap').html(minute_html).css({
                'left': cur_time.context.offsetLeft,
                'top': cur_time.context.offsetTop
            }).show();
        };

        function hourEvent() {
            time_wrap.on('click', '.Hunter-hour', function (event) {
                event.preventDefault();
                event.stopPropagation();
                var _this = $(this);

                time_wrap.find('.Hunter-hour').removeClass('active');
                time_wrap.find('.Hunter-hour-name').removeClass('active');
                time_wrap.find('.Hunter-minute-wrap').hide().children().remove();

                _this.addClass('active');
                _this.find('.Hunter-hour').addClass('active');

                var hourValue = _this.data('hour');
                var temp = box.val().split(":");
                if (temp.length > 1) {
                    box.val(hourValue + ":" + temp[1]);
                } else {
                    box.val(hourValue + ":00");
                }
                buildMinuteTpl(_this);

                if (options.callback) options.callback(box);

                return false;
            });
        };

        function minuteEvent() {
            time_wrap.on('click', '.Hunter-minute', function (event) {
                event.preventDefault();
                event.stopPropagation();
                var _this = $(this);
                var minuteValue = _this.data('minute');
                var temp = box.val().split(":")[0] + ":" + minuteValue;
                box.val(temp);
                template.remove();
                if (options.callback) options.callback(box);
                return false;
            });
        };

        function cleanBtnEvent(obj) {
            time_wrap.on('click', '#Hunter_clean_btn', function (event) {
                event.preventDefault();
                event.stopPropagation();
                box.val(obj[0]);
                htmlArray = [];
                template.remove();
                if (options.callback) options.callback(box);
                return false;
            });
        };
    };

    $.fn.extend({
        hunterTimePicker: function (options) {
            options = $.extend({}, options);
            this.each(function () {
                new $.hunterTimePicker(this, options);
            });
            return this;
        }
    });
})(jQuery);
var url = "http://test2.dalinggong.com";
$(function () {
    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf(" MSIE 8.0") > -1) {
        $('.qblg-options div:last-child').css("border-bottom", "0px dashed transparent");
        $(".dlg-statistic ul li:nth-child(odd)>div").css("border-right", "1px solid #dddddd");
        $(".dlg-statistic .dlg-row-7 ul li:nth-child(2)>div").css("border-right", "1px solid #dddddd");
    }
    if (typeof $.datepicker == 'undefined') {
        $("body").append("<script src=\"./js/datepicker/jquery-ui.js\" type=\"text/javascript\"><\/script>");
    }
})

function jumpPage(pageUrl, id) {
    $("#loadingPage").show();
    $("#" + id).hide();
    $.get(pageUrl, function (data) {
        $("#loadingPage").hide();
        $("#" + id).html("").append(data);
        $("#" + id).show();
    })
}

//详情跳转带id     注意：只保存id
function jumpChildrenPage(pageUrl, id) {
    sessionStorage.setItem("jobId", getQueryString(pageUrl, "jobId"));
    jumpPage(pageUrl, id)
}

function getQueryString(url, name) {
    var urlQuery = "";
    if (url.indexOf("?") > -1) {
        urlQuery = url.split("?")[1];
        if (urlQuery.indexOf("&") > -1) {
            var arrQuery = urlQuery.split("&");
            arrQuery.each(function (arr) {
                if (name == arr.split("=")[0]) {
                    return arr.split("=")[1];
                }
            })
        } else {
            if (name == urlQuery.split("=")[0]) {
                return urlQuery.split("=")[1];
            }
        }
    } else {
        return "";
    }
}

function addActive(obj) {
    $(obj).siblings().removeClass("active");
    $(obj).addClass("active");
}

function changeActive(obj) {
    $(obj).find("div").addClass("active");
    $(obj).siblings().find("div").removeClass("active");
}

function pageNum(id) {
    $('#' + id).paging({
        initPageNo: 3, // 初始页码
        totalPages: 10, //总页数
        totalCount: '合计' + 10 + '条数据', // 条目总数
        slideSpeed: 600, // 缓动速度。单位毫秒
        jump: true, //是否支持跳转
        callback: function (page) { // 回调函数
            console.log(page);
        }
    });
}

function agreeMore(id) {
    console.log($("#" + id).prop("checked"));
}

function refuseMore(id) {
    console.log($("#" + id).prop("checked"));
}

function toggleSelect(obj, id) {
    if ($(obj).html().indexOf('隐藏') > -1) {
        $(obj).html("显示筛选")
    } else {
        $(obj).html("隐藏筛选")
    }
    $("#" + id).toggle();
}

$(".modal_tan span.close").click(function () {
    $(".modal_bg_ground").hide();
})

function closeTime(obj) {
    $(obj).parent().remove();
}

function getDatePicker(obj1, obj2) {
    from = $("#" + obj1).datepicker()
        .on("change", function () {
            to.datepicker("option", "minDate", getDate(this));
        }),
        to = $("#" + obj2).datepicker()
            .on("change", function () {
                from.datepicker("option", "maxDate", getDate(this));
            });

// 日期转换
    function getDate(element) {
        var date;
        try {
            date = $.datepicker.parseDate("yy-mm-dd", element.value);
        } catch (error) {
            date = null;
        }
        return date;
    }
}

// 兼容处理
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError("this is null or not defined");
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}
Date.prototype.format = function (format) {
    var o = {
        // "y+": this.getFullYear(),
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

function changeDate(days) {
    var today = new Date(); // 获取今天时间
    var begin,endTime,dateRange;
    today.setTime(today.getTime() - days * 24 * 3600 * 1000);
    begin = today.format('yyyy-MM-dd');
    endTime = new Date().format('yyyy-MM-dd');
    $("#startDate").val(begin);
    $("#endDate").val(endTime);
    dataJobTask(0);
}