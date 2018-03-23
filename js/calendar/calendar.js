;(function ($, window, document, undefined) {
    var Calendar = function (elem, options) {
        var box = elem, self = this;
        this.$calendar = $("<div class='calendar'></div>");
        this.defaults = {
            ifSwitch: true,
            hoverDate: false,
            status: [
                {
                    workDate: "20180102",
                    status: 0,
                    price: "-",
                    startTime: "9:00",
                    endTime: "18:00",
                    isPay: false
                },
                {
                    workDate: "20180103",
                    status: 1,
                    price: "200元",
                    startTime: "9:00",
                    endTime: "18:00",
                    isPay: false
                },
                {
                    workDate: "20180104",
                    status: 3,
                    price: "-",
                    startTime: "9:00",
                    endTime: "18:00",
                    isPay: false
                },
                {
                    workDate: "20180105",
                    status: 4,
                    price: "-",
                    startTime: "--",
                    endTime: "--",
                    isPay: false
                },
                {
                    workDate: "20180110",
                    status: 4,
                    price: "-",
                    startTime: "--",
                    endTime: "--",
                    isPay: false
                }
            ]
        };
        this.opts = $.extend({}, this.defaults, options);
        $("body").click(function (event) {//一定要有这个判断
            if($(event.target).attr("onclick")!=='showCalendar(this)'){
                if($('.calendar').length>0){
                    self.$calendar.remove();
                }
            }

        });
        self.$calendar.css({
            'left': options.left,
            'top': options.top
        });
        $(".calendar").remove();
        $("body").append(self.$calendar);
        self.$calendar.show();
        self.$calendar.click(function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
    };
    Calendar.prototype = {
        showHoverInfo: function (obj) { // hover 时显示当天信息
            var _dateStr = $(obj).attr('data');
            var statusStr = $(obj).find("i.status").attr("data-status");
            var changeStr = _dateStr.substr(0, 4) + '-' + _dateStr.substr(4, 2) + '-' + _dateStr.substring(6);
            var html = "";
            var that=this;
            this.$calendar_today.show();
            this.$calendar_today
                .stop()
                .animate({opacity: 1});

            var orderid = $("#orderid").val();
            var employer_id = $("#employer_id").val();
            $.ajax({
                url: url + '/order/'+orderid+'/child/'+changeStr,
                type: 'post',
                dataType: 'json',
                data: "userid=" + employer_id +
                "&clienttype=0" +
                "&access_token=" + access_token,
                timeout: '1000',
                cache: 'false',
                success: function (jsData) {
                    console.log("calendar日期插件",jsData)

                    if (jsData.body.data.cost_accounting_type == "1") {

                        html += "<table class='calendar-table'>";
                        html += "   <tr>";
                        html += "       <td>";
                        if (jsData.body.data.attendance.start_date_time == null) {
                            html += "       <div>开工打卡：未打卡</div>";
                        }else {
                            html += "       <div>开工打卡：" + jsData.body.data.attendance.start_date_time + "</div>";
                        }

                        if (jsData.body.data.attendance.end_date_time == null) {
                            html += "       <div>收工打卡：未打卡</div>";
                        }else {
                            html += "       <div>收工打卡：" + jsData.body.data.attendance.end_date_time + "</div>";
                        }

                        html += "           <div>班次：" + jsData.body.data.work_shift + "</div>";
                        html += "       </td>";
                        html += "       <td style='text-align: right;'>";
                        if (jsData.body.data.accounting.wage_sys == null) {
                            html += "       <div>报酬：0元</div>";
                        }else {
                            html += "       <div>报酬：" + jsData.body.data.accounting.wage_sys + "元</div>";
                        }

                        if (jsData.body.data.accounting.reward == null) {
                            html += "       <div>小费：0元</div>";
                        }else {
                            html += "       <div>小费："+jsData.body.data.accounting.reward+"元</div>";
                        }

                        if (jsData.body.data.amount == null) {
                            html += "       <div>合计：0元</div>";
                        }else {
                            html += "       <div>合计："+jsData.body.data.amount+"元</div>";
                        }

                        for (var j = 0; j < jsData.body.data.buttons.length; j++) {
                            if (jsData.body.data.buttons[j].operateStatusText == "确认金额") {
                                 //html += "    <button class=\"btn btn-default dlg-red-color\" onclick=\"querenwancheng('"+jsData.body.data.day_date+"','"+jsData.body.data.order_id+"')\">"+jsData.body.data.buttons[j].operateStatusText+"</button>";
                                html += "    <button class=\"btn btn-default dlg-red-color\" onclick=\"checkpayModal2()\">"+jsData.body.data.buttons[j].operateStatusText+"</button>";
                            }
                        }
                        html += "       </td>";
                        html += "   </tr>";
                        html += "</table>";

                    }else if (jsData.body.data.cost_accounting_type == "2") {
                        html += "<table class='calendar-table'>";
                        html += "   <tr>";
                        html += "       <td style='text-align: right;'>";
                        html += "           <div>提交数量：" + jsData.body.data.piecework.submission_count + "</div>";
                        if (jsData.body.data.status_text == "待验收") {

                        }else if (jsData.body.data.status_text == "待结算") {
                            //计算不通过数量
                            var number = jsData.body.data.piecework.submission_count - jsData.body.data.piecework.acceptance_count;

                            html += "       <div>通过数量："+jsData.body.data.piecework.acceptance_count+"</div>";
                            html += "       <div>不通过数量："+number+"</div>";
                            if (jsData.body.data.accounting.reward == null) {
                                html += "       <div>小费：0元</div>";
                            }else {
                                html += "       <div>小费："+jsData.body.data.accounting.reward+"元</div>";
                            }
                        }
                        html += "           <div>合计："+jsData.body.data.amount+"元</div>";
                        for (var j = 0; j < jsData.body.data.buttons.length; j++) {
                            if (jsData.body.data.buttons[j].operateStatusText == "确认金额") {
                                // html += "    <button class=\"btn btn-default dlg-red-color\" onclick=\"querenwancheng('"+jsData.body.data.day_date+"','"+jsData.body.data.order_id+"','"+jsData.body.data.job_id+"')\">"+jsData.body.data.buttons[j].operateStatusText+"</button>";
                                 html += "    <button class=\"btn btn-default dlg-red-color\" onclick=\"checkpayModal()\">"+jsData.body.data.buttons[j].operateStatusText+"</button>";
                            }
                        }
                        html += "       </td>";
                        html += "   </tr>";
                        html += "</table>";
                    }else {
                        html += "<table class='calendar-table'>";
                        html += "   <tr>";
                        html += "       <td>";
                        if (jsData.body.data.attendance.start_date_time == null) {
                            html += "       <div>开工打卡：未打卡</div>";
                        }else {
                            html += "       <div>开工打卡：" + jsData.body.data.attendance.start_date_time + "</div>";
                        }

                        if (jsData.body.data.attendance.end_date_time == null) {
                            html += "       <div>收工打卡：未打卡</div>";
                        }else {
                            html += "       <div>收工打卡：" + jsData.body.data.attendance.end_date_time + "</div>";
                        }

                        html += "           <div>班次：" + jsData.body.data.work_shift + "</div>";
                        html += "           <div>提交数量：" + jsData.body.data.piecework.submission_count + "</div>";
                        //计算不通过数量
                        var number = jsData.body.data.piecework.submission_count - jsData.body.data.piecework.acceptance_count;
                        html += "           <div>通过数量：" + jsData.body.data.piecework.acceptance_count + "</div>";
                        html += "           <div>不通过数量：" + number + "</div>";
                        html += "       </td>";
                        html += "       <td style='text-align: right;'>";
                        if (jsData.body.data.accounting.wage_sys == null) {
                            html += "       <div>报酬：0元</div>";
                        }else {
                            html += "       <div>报酬：" + jsData.body.data.accounting.wage_sys + "元</div>";
                        }

                        if (jsData.body.data.accounting.reward == null) {
                            html += "       <div>小费：0元</div>";
                        }else {
                            html += "       <div>小费："+jsData.body.data.accounting.reward+"元</div>";
                        }

                        if (jsData.body.data.amount == null) {
                            html += "       <div>合计：0元</div>";
                        }else {
                            html += "       <div>合计："+jsData.body.data.amount+"元</div>";
                        }

                        for (var j = 0; j < jsData.body.data.buttons.length; j++) {
                            if (jsData.body.data.buttons[j].operateStatusText == "确认金额") {
                                html += "    <button class=\"btn btn-default dlg-red-color\" onclick=\"checkpayModal()\">"+jsData.body.data.buttons[j].operateStatusText+"</button>";
                            }
                        }
                        html += "       </td>";
                        html += "   </tr>";
                        html += "</table>";
                    }
                    that.$calendarToday_week.html("").append(html);
                    $("#day_date").val(jsData.body.data.day_date);
                    $("#order_id").val(jsData.body.data.order_id);
                    $("#job_id").val(jsData.body.data.job_id);
                }
            })
        },
        showCalendar: function () { // 输入数据并显示
            var self = this;
            var year = dateObj.getDate().getFullYear();
            var month = dateObj.getDate().getMonth() + 1;
            var dateStr = returnDateStr(dateObj.getDate());
            var firstDay = new Date(year, month - 1, 1); // 当前月的第一天
            this.$calendarTitle_text.text(year + '年' + dateStr.substr(4, 2) + '月');
            this.$calendarDate_item.each(function (i) {
                var that = this;
                // allDay: 得到当前列表显示的所有天数
                var allDay = new Date(year, month - 1, i + 1 - firstDay.getDay());
                var allDay_str = returnDateStr(allDay);
                var dateDesc = "";
                var _strHtml = "<span>" + allDay.getDate() + "</span>";
                if (returnDateStr(new Date()) === allDay_str) {
                    $(this).attr('class', "item item-curDay");
                } else if (returnDateStr(firstDay).substr(0, 6) === allDay_str.substr(0, 6)) {
                    $(this).attr('class', "item item-item-curMonth");
                } else {
                    $(this).attr('class', 'item');
                }

                self.opts.status.forEach(function (value) {

                    if (allDay_str == value.workDate) {
                        $(that).attr("class", 'item active');
                        dateDesc = value.status_text
                        // switch (value.status) {
                        //     case "30":
                        //         dateDesc = "待验收";
                        //         break;
                        //     case 1:
                        //         dateDesc = "正常";
                        //         break;
                        //     case 3:
                        //         dateDesc = "干活中";
                        //         break;
                        //     case 4:
                        //         dateDesc = "";
                        //         break;
                        //     case "50":
                        //         dateDesc = "已结算";
                        //         break;
                        //     case "40":
                        //         dateDesc = "待结算";
                        //         break;
                        // }
                        // if (value.status == 1) {
                        //     _strHtml += "<i class='status' data-status='" + value.status + "'>" + dateDesc + "</i><i class='price'>200元</i>";
                        // } else {
                        //     _strHtml += "<i class='status' data-status='" + value.status + "'>" + dateDesc + "</i><i class='price'>" + value.price + "元</i>";
                        // }
                        if (value.price == null) {
                            _strHtml += "<i class='status' data-status='" + value.status + "'>" + dateDesc + "</i><i class='price'>0元</i>";
                        }else {
                            _strHtml += "<i class='status' data-status='" + value.status + "'>" + dateDesc + "</i><i class='price'>" + value.price + "元</i>";
                        }

                    }
                });
                $(this).html("").append(_strHtml).attr('data', allDay_str);
            });
        },
        hideCalendar: function () {
            this.$calendar_today.hide();
            this.$calendar.remove();
        },
        renderDOM: function () { // 渲染DOM
            this.$calendar_title = $('<div class="calendar-title"></div>');
            this.$calendar_week = $('<ul class="calendar-week"></ul>');
            this.$calendar_date = $('<ul class="calendar-date"></ul>');
            this.$calendar_today = $('<div class="calendar-today"></div>');
            var _titleStr = '<div class="arrow">' +
                '<span class="arrow-prev"><</span>' +
                '<a href="#" class="title"></a>' +
                '<span class="arrow-next">></span>' +
                '</div><i class="close">×</i>';
            var _weekStr = '<li class="item">日</li>' +
                '<li class="item">一</li>' +
                '<li class="item">二</li>' +
                '<li class="item">三</li>' +
                '<li class="item">四</li>' +
                '<li class="item">五</li>' +
                '<li class="item">六</li>';
            var _dateStr = '';
            var _dayStr = '<i class="triangle"></i>' +
                '<div class="date"></div>' +
                '<div class="week"></div>';

            for (var i = 0; i < 6; i++) {
                _dateStr += '<li class="item"><span>26</span><i></i></li>' +
                    '<li class="item"><span>26</span><i></i></li>' +
                    '<li class="item"><span>26</span><i></i></li>' +
                    '<li class="item"><span>26</span><i></i></li>' +
                    '<li class="item"><span>26</span><i></i></li>' +
                    '<li class="item"><span>26</span><i></i></li>' +
                    '<li class="item"><span>26</span><i></i></li>';
            }

            this.$calendar_title.html(_titleStr);
            this.$calendar_week.html(_weekStr);
            this.$calendar_date.html(_dateStr);
            this.$calendar_today.html(_dayStr);

            this.$calendar.append(this.$calendar_title, this.$calendar_week, this.$calendar_date, this.$calendar_today);
        },
        inital: function () { // 初始化
            var self = this;
            this.renderDOM();
            this.$calendarTitle_text = this.$calendar_title.find('.title');
            this.$arrow_prev = this.$calendar_title.find('.arrow-prev');
            this.$arrow_next = this.$calendar_title.find('.arrow-next');
            this.$calendarDate_item = this.$calendar_date.find('.item');
            this.$calendarToday_date = this.$calendar_today.find('.date');
            this.$calendarToday_week = this.$calendar_today.find('.week');
            this.showCalendar();
            if (this.opts.ifSwitch) {
                this.$arrow_prev.bind('click', function () {
                    var _date = dateObj.getDate();
                    dateObj.setDate(new Date(_date.getFullYear(), _date.getMonth() - 1, 1));
                    self.$calendar_today.hide();
                    self.showCalendar();
                });
                this.$arrow_next.bind('click', function () {
                    var _date = dateObj.getDate();
                    dateObj.setDate(new Date(_date.getFullYear(), _date.getMonth() + 1, 1));
                    self.$calendar_today.hide();
                    self.showCalendar();
                });
            }
            this.$calendar_title.find('i.close').bind("click", function () {
                self.hideCalendar();
            })
            this.$calendarDate_item.bind("click", function () {
                if ($(this).hasClass('active')) {
                    self.showHoverInfo($(this));

                }
            });
            this.$calendar_today.bind("click", function () {
                // self.$calendar_today.hide();
            })
        },
        constructor: Calendar
    };
    $.fn.calendar = function (options) {
        var calendar = new Calendar(this, options);
        return calendar.inital();
    };
    // ========== 使用到的方法 ==========
    var dateObj = (function () {
        var _date = new Date();
        return {
            getDate: function () {
                return _date;
            },
            setDate: function (date) {
                _date = date;
            }
        }
    })();

    function returnDateStr(date) { // 日期转字符串
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        month = month < 10 ? ('0' + month) : ('' + month);
        day = day < 10 ? ('0' + day) : ('' + day);

        return year + month + day;
    };

    function formatDate(date) {
        var dates = {};
        dates.year = date.substr(0, 4);
        dates.month = date.substring(4, 6);
        dates.day = date.substr(date.length - 2, date.length);
        return dates;
    }

    function changingStr(fDate) { // 字符串转日期
        var fullDate = fDate.split("-");
        return new Date(fullDate[0], fullDate[1] - 1, fullDate[2]);
    };
})(jQuery, window, document);

function checkpayModal() {
    $("#hesuan_modal").show();
}

function checkpayModal2() {
    $("#check_number_modal").show();
}
