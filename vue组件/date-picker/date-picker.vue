<template>
	<div class="x-date-picker" :class="{'range-type': dateCount > 1}">
		<div class="input-wrapper" @click="toggleDate">
			<!-- 输入框 -->
	        <input type="text" 
	        ref="input"
	        v-model="inputValue" 
	        @change="changeVal(inputValue)" 
	        class="date-input" 
	        :readonly="readonly"
	        :disabled="disabled"
	        :placeholder="placeholder">
	        <!-- 图标 -->
			<Icon class="calendar-ico" type="calendar"></Icon>
		</div>
		<!-- 日期体 -->
        <div ref="picker"
        class="date-picker-wrapper" 
        :style="pickStyle" 
        :class="{active: showDate}">
        	<!-- 快捷方式 -->
            <div class="date-picker-header" v-if="shortcuts && shortcuts.length">
                <div class="recent-item" 
                v-for="shortcut in shortcuts" 
                :class="{active: isShortCutActive(shortcut)}"
                @click="clickShortCut(shortcut)"
                >{{shortcut.name}}</div>
            </div>
            <!-- 日期列表 -->
            <div class="date-picker-container">
                <div class="date-picker-item" v-for="date in mDate.dates">
                	<!-- 年 -->
                    <div class="date-picker-title">
                        <div class="prev-btn year-btn" @click="changeMonth(-12)"></div>
                        <div class="year-title">{{date.title}}</div>
                        <div class="next-btn year-btn" @click="changeMonth(12)"></div>
                    </div>
                    <!-- 星期 -->
                    <div class="date-picker-week">
                        <div class="prev-btn month-btn"  @click="changeMonth(-1)"></div>
                        <div class="week-title">
                            <div class="week-wrapper" v-for="i in weekTitle">
                                <div class="week-day">
                                    {{i}}
                                </div>
                            </div>
                        </div>
                        <div class="next-btn month-btn"  @click="changeMonth(1)"></div>
                    </div>
                    <!-- 日期 -->
                    <div class="date-picker-day">
                        <div class="day-wrapper" :class="{
                        active: (isActive(data) || isHover(data)), 
                        disabled: isDisabled(data),
                        'not-current': !data.isCurrent,
                        start: isStart(data),
                        end: isEnd(data),
                        today: isToday(data)}" 
                        @mouseenter="hoverDay(data, date.month, date.year)"
                        @click="clickDay(data, date.month, date.year)"
                        v-for="data in date.data">
                        	<!-- 背景 -->
                            <div class="mark-block"></div>
                            <!-- 日期 -->
                            <div class="day">{{data.data}}</div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 底部 -->
            <slot name="footer">
	            <div class="date-picker-footer" v-if="showFooter">
	                <div class="date-picker-btn" @click="clickOk">确定</div>
	            </div>
            </slot>
        </div>
    </div>

</template>
<script type="text/javascript">
	import moment from 'moment';
	export default{
		name: 'date-picker',
		data(){
			return {
				
				totalCountDays: 42, //总的天数展示
				historyVal: null, // 记录点击之前的值
				isRanging: false,// 标记是否在选择范围
				hoveringStart: null,// 选择范围时，鼠标悬浮的起始日期
				hoveringEnd: null, //选择范围时，鼠标悬浮的结束日期
				inputValue: '',//输入框内容
				showDate: false,//默认是否显示日期体
				today: {//今天
					month: 1,
					data: 1
				},
				isOkClicked: false,//是否点击ok按钮，用来设置confirm
				rangeStart: null, //选择范围段时的起始日期
				rangeEnd: null, //选择范围段的结束日期
				activeDates: [],//选择的日期
				mDate:{//用来构建日期选择器
					startDateString: '',//年月起始信息
					endDateString: '',//年月结束信息
					dates: []//展示的日期
				}
			}
		},
		props: {
			keepHistory: {
				type: Boolean,
				default: true
			},
			// 是否点击非日期组件体时，隐藏日期选择部分
			maskClick: {
				type: Boolean,
				default: true
			},
			// 是否需要点击确定才会消失日期选择部分
			confirm: {
				type: Boolean,
				default: false
			},
			// 选择器的样式
			pickStyle: {
				type: Object,
				default(){
					return {}
				}
			},
			// 展示footer部分
			showFooter: {
				type: Boolean,
				default: true
			},
			// 快捷部分
			shortcuts: {
				type: Array,
				default(){

					return [];
				}
			},
			// 使用v-model的形式来对接
			value: {
				type: [Date, String, Array]
			},
			// 最大日期
			maxDate: {
				type: [Number, Date, String],
				default: Infinity
			},
			// 最小日期
			minDate: {
				type: [Number, Date, String],
				default: Infinity
			},
			// placeholder
			placeholder: {
				type: String,
				default: '选择日期'
			},
			// 输入框的状态
			disabled: {
				type: Boolean,
				default: false
			},
			// 输入框的状态
			readonly: {
				type: Boolean,
				default: true
			},
			// 日期体的数量，默认一个，最多2个
			dateCount: {
				type: Number,
				default: 1
			},
			// 年月的格式，详细见moment
			titleFormat: {
				type: String,
				default: 'YYYY年MM月'
			},
			// 日期格式，此处在输出和标准化输入都用这个
			dateFormat: {
				type: String,
				default: 'YYYY-MM-DD'
			},
			// 范围分割符
			rangeSpliter: {
				type: String,
				default: '~'
			},
			// 日期分割符，建议不要更改，与dateFormat格式一致
			dateSpliter: {
				type: String,
				default: '-'
			},
			// 多选的分割符
			multiSpliter: {
				type: String,
				default: ','
			},
			// 星期
			weekTitle: {
				type: Array,
				default(){
					return ['日', '一', '二', '三', '四', '五', '六']
				}
			},
			// 是否多选，多选开启可以选择多个日期，但是不能跟range重合
			multiple: {
				type: Boolean,
				default: false
			},
			// 范围选择
			range: {
				type: Boolean,
				default: false
			},
			// 自动切换，暂时不用
			autoToggle: {
				type: Boolean,
				default: true
			},
			// 当前的日期，提供一个选择器初始化的日期
			currentDate: {
				type: [Date, String],
				default(){
					return new Date();
				}
			}
		},
		computed: {
			// 计算起始日期，根据minDate来计算
			startDate(){
				if(typeof this.minDate === 'string'){
					return moment(this.minDate);
				}else if(typeof this.minDate === 'object' && this.minDate instanceof Date){
					return moment(this.minDate);
				}else if(!isFinite(this.minDate)){
					return this.minDate;
				}else{
					return moment(new Date(this.minDate));
				}
			},
			// 结束日期，根据maxDate来计算
			endDate(){
				if(typeof this.minDate === 'string'){
					return moment(this.maxDate);
				}else if(typeof this.maxDate === 'object' && this.minDate instanceof Date){
					return moment(this.maxDate);
				}else if(!isFinite(this.maxDate)){
					return this.maxDate;
				}else{
					return moment(new Date(this.maxDate));
				}
			}
		},
		watch:{
			showDate(val){
				this.$emit('on-open-change', val);
				if(!val){
					this.historyVal && this.changeVal(this.historyVal);
				}
			},
			// 选择日期数量变化的时候初始化下日期
			dateCount(val){
				this.initDate(this.today);
			},
			// 当前日期变化的话重新初始化
			currentDate(){
				this.init();
			},
			// v-model的值变化之后重新设置选择器
			value(val){
				this.changeVal(val);
				// 记录确定选择之前的日期
				if(this.keepHistory){
					this.historyVal = this.value;
				}
				// 防止confirm为true时无法设置inputValue的值
				this.initInputValue();
			},
			// 选择范围结束日期，变化的时候，给输入框设置值
			rangeEnd(val){
				if(this.confirm && !this.isOkClicked){
					return
				}
				if(val){
					this.inputValue = this.rangeStart.format(this.dateFormat) + this.rangeSpliter + val.format(this.dateFormat);
					if(!this.confirm){
						this.clickOk();
						this.$emit('input', this.inputValue);
					}
				}else if(this.rangeStart){
					this.inputValue = this.rangeStart.format(this.dateFormat) + this.rangeSpliter;
				}
			},
			// 选择范围起始日期，变化的时候，给输入框设置值
			rangeStart(val){
				if(this.confirm && !this.isOkClicked){
					return
				}
				if(val){
					this.inputValue = val.format(this.dateFormat) + this.rangeSpliter;
					if(this.rangeEnd){
						this.inputValue +=  this.rangeEnd.format(this.dateFormat);
					}
				}else{
					this.rangeEnd = null;
					this.hoveringEnd = null;
					this.hoveringStart = null;
					this.inputValue = '';
				}
			},
			// 选择的单个日期变化的时候，设置输入框值
			activeDates(val){
				if(this.confirm && !this.isOkClicked){
					return
				}
				if(val && val.length){
					this.inputValue = this.formatDates(val);
					
				}else{
					this.inputValue = '';
				}
			},
			inputValue(val){
				this.$emit('on-date-change', val);
			}
		},

		methods: {
			// 初始化输入框的内容
			initInputValue(){
				if(this.range){
					if(this.rangeStart && this.rangeEnd){
						this.inputValue = this.rangeStart.format(this.dateFormat) + this.rangeSpliter + this.rangeEnd.format(this.dateFormat);
					}
				}else{
					this.inputValue = this.formatDates(this.activeDates);
				}
			},
			// 点击ok按钮
			clickOk(){
				if(this.range){
					var str = '';
					if(this.rangeStart && this.rangeEnd){
						str += this.rangeStart.format(this.dateFormat) + this.rangeSpliter + this.rangeEnd.format(this.dateFormat);
					}
					this.confirm && this.$emit('input', str);
					this.$emit('on-ok', str);
				}else{
					this.confirm && this.$emit('input', this.formatDates(this.activeDates));
					this.$emit('on-ok', this.formatDates(this.activeDates));
				}
				this.historyVal = null;
				this.showDate = false;
				this.isOkClicked = true;
			},
			// 切换日期选择器
			toggleDate(){
				if(this.disabled){
					return;
				}
				this.showDate = !this.showDate;
				this.isOkClicked = false;
				var vm = this;
				if(!this.showDate){
					return;
				}
				// 如果设置了记录历史，返回设置之前的值
				if(this.keepHistory && this.historyVal){
					this.changeVal(this.historyVal);
				}
				// 计算日期选择器的位置
				this.$nextTick(function(){
					$('.x-date-picker .date-picker-wrapper').each(function(index, el){
						if(el !== vm.$refs.picker){
							$(el).removeClass('active');
						}
					});
					var iOffset = vm.$refs.input.getBoundingClientRect();
					var pOffset = vm.$refs.picker.getBoundingClientRect();

					if(iOffset.left + pOffset.width > window.innerWidth){
						var dx = iOffset.left + pOffset.width - window.innerWidth + 30;
						vm.$refs.picker.style.left = -dx + 'px';
					}else{
						vm.$refs.picker.style.left = '0';
					}
					if(iOffset.top + iOffset.height + pOffset.height > window.innerHeight){
						var dy = iOffset.top + iOffset.height + pOffset.height - window.innerHeight + 30;
						vm.$refs.picker.style.top = (-iOffset.height - dy) + 'px';
					}else{
						vm.$refs.picker.style.top = iOffset.height + 'px';
					}
				})
			},
			isShortCutActive(shortcut){

			},
			// 点击快捷选择
			clickShortCut(shortcut){
				var val = shortcut.value;
				if(typeof val === 'object' && val instanceof Array){
					var str = [];
					for(let item of val){
						var itemStr = moment(item).format(this.dateFormat);
						str.push(itemStr);
					}
					if(this.range){
						str.length = 2;
						str = str.join(this.rangeSpliter);
					}else{
						str = str.join(this.multiSpliter);
					}
					this.changeVal(str);
				}else{
					this.changeVal(val);
				}
			},
			// 格式化日期字符
			formatString(year, month, date){

				return year + this.dateSpliter + (month > 9 ? month : '0'+month) + this.dateSpliter + (date > 9 ? date : '0' + date);
			},
			// 值变化
			changeVal(value){
				if(typeof value === 'object'){
					if(value instanceof Date){
						value = moment(value).format(this.dateFormat);
					}else if(value instanceof Array){
						var valueArr = [];
						for(let val of value){
							valueArr.push(moment(value, this.dateFormat).format(this.dateFormat));
						}
						if(this.range){
							value = valueArr.join(this.rangeSpliter);
						}else{
							value = valueArr.join(this.multiSpliter);
						}
					}
				}

				if(this.range){
					if(!value){
						this.rangeStart = null;
						this.rangeEnd = null;
						return
					}
					var ranges = value.split(this.rangeSpliter);
					if(ranges && ranges.length){
						var rangeStart = ranges[0] && moment(ranges[0]);
						var rangeEnd = ranges[1] && moment(ranges[1]);
						if(rangeStart){
							var rangeStartData = {
								year: rangeStart.year(),
								month: rangeStart.month(),
								data: rangeStart.date()
							}
							if(!this.isDisabled(rangeStartData)){
								this.rangeStart = rangeStart;
							}else{
								this.rangeStart = this.startDate.clone();
							}
						}

						if(rangeEnd){
							var rangeEndData = {
								year: rangeEnd.year(),
								month: rangeEnd.month(),
								data: rangeEnd.date()
							}
							if(!this.isDisabled(rangeEndData)){
								this.rangeEnd = rangeEnd;
							}else{
								this.rangeEnd = moment(this.endDate);
							}
						}
						if(!this.rangeEnd){
							this.rangeEnd = this.rangeStart;
						}
						// 不在范围内的话，就重新设置日期选择器
						if(!this.date.isBetween(moment(this.rangeStart).add(-1, 'days'), moment(this.rangeEnd).add(1, 'days'), 'date')){
							this.initDate(this.rangeStart);
						}
						this.hoveringStart = this.rangeStart;
						this.hoveringEnd = this.rangeEnd;
					}
				}else{
					if(!value){
						this.activeDates = [];
						return
					}
					var dates = value.split(this.multiSpliter);
					this.activeDates = this.parseDataFromStrs(dates);
					var isInRange = false, lastDate = null;
					for(let date of this.activeDates){
						var dateStr = this.formatString(date.year, date.month + 1, date.data);
						var momentDate = moment(dateStr);
						var nextDate = momentDate.clone();
						if(this.date.isBetween(momentDate, nextDate)){
							isInRange = true;
						}
						lastDate = momentDate;
					}
					if(!isInRange){
						this.initDate(lastDate);
					}
				}
			},
			// 解析格式化数据，形成跟getDate返回的值一样的数据
			parseDataFromStrs(data){
				var dateArr = [];
				for(let dateStr of data){
					var dateInfo = dateStr.split(this.dateSpliter);
					var year = parseInt(dateInfo[0]);
					var month = parseInt(dateInfo[1]) - 1;
					var date = parseInt(dateInfo[2]);
					var dateData = {
						year: year,
						month: month,
						data: date
					};
					if(!this.isDisabled(dateData)){
						dateArr.push({
							year: year,
							month: month,
							data: date
						});
					}
				}
				return dateArr;
			},
			// 格式化数据，返回字符串
			formatDates(val){
				var dateStrings = [];
				for(let date of val){
					var str = this.formatString(date.year, date.month + 1, date.data);
					var dateStr = moment(str).format(this.dateFormat);
					dateStrings.push(dateStr)
				}
				return dateStrings.join(this.multiSpliter);
			},
			// 月份切换
			changeMonth(months){
				var date = this.date.add(months, 'months');
				if(months === -12 || months === 12){
					this.$emit('changeYear', date.format(this.dateFormat));
				}else{
					this.$emit('changeMonth', date.format(this.dateFormat));
				}
				this.initDate(date);
			},
			// 日期是否禁止选择
			isDisabled(data){
				if(this.startDate === Infinity && this.endDate === Infinity){
					return false;
				}else if(this.startDate === Infinity){
					var month = this.endDate.month();
					var year = this.endDate.year();
					var date = this.endDate.date();
					if(data.year > year){
						return true;
					}else if(data.month > month && data.year === year){
						return true;
					}else if(data.month == month && data.year === year && data.data > date){
						return true;
					}
					return false;
				}else{
					var month = this.startDate.month();
					var year = this.startDate.year();
					var date = this.startDate.date();
					if(data.year < year){
						return true;
					}else if(data.year === year && data.month < month){
						return true;
					}else if(data.data < date && data.month == month && data.year === year){
						return true;
					}
				}
				return false;


			},
			// 获取日期的单元格信息
			getDate(date){
				var currentMoment = moment(date);
				var prevMoment = currentMoment.clone().add(-1, 'months');
				var nextMoment = currentMoment.clone().add(1, 'months');

				var dateArray = [];
				// 当前的第一天
				var currentStartMoment =  currentMoment.clone().startOf('month');

				// 当前月的第一天的星期
				var currentDay = currentStartMoment.day();
				var prevMaxDays = prevMoment.daysInMonth();
				var prevMonth = prevMoment.month();
				var prevYear = prevMoment.year();
				// 默认在第一行加上上个月的信息
				currentDay = currentDay === 0 ? 6 : currentDay;
				// 如果是星期天就不加
				for(var i = currentDay - 1; i > -1; i--){
					dateArray.push({
						month: prevMonth,
						year: prevYear,
						isCurrent: false,
						data: prevMaxDays - i
					});
				}
				// 当前月的日期
				var currentMaxDays = currentMoment.daysInMonth();
				var currentYear = currentMoment.year();
				var currentMonth = currentMoment.month();
				// 添加正常的日期
				for(var i = 1; i <= currentMaxDays; i++){
					dateArray.push({
						month: currentMonth,
						year: currentYear,
						isCurrent: true,
						data: i
					});
				}
				// 下个月的日期，
				var leftLength = this.totalCountDays - dateArray.length;

				// 下一个月的信息
				var nextMonth = nextMoment.month();
				var nextYear = nextMoment.year();

				// 添加后面的日期
				for(var i = 0; i < leftLength; i++){
					dateArray.push({
						data: i + 1,
						year: nextYear,
						isCurrent: false,
						month: nextMonth
					});
				}

				return dateArray;
			},
			// 初始化日期展示
			initDate(date){
				var currentMoment = moment(date);
				this.date = currentMoment.clone();

				this.mDate.dates = [];

				this.mDate.dates.push({
					title: currentMoment.format(this.titleFormat),
					year: currentMoment.year(),
					month: currentMoment.month(),
					data: this.getDate(currentMoment)
				});
				if(this.dateCount === 2){
					var nextMoment = currentMoment.clone().add(1, 'months');
					this.mDate.dates.push({
						title: nextMoment.format(this.titleFormat),
						month: nextMoment.month(),
						year: nextMoment.year(),
						data: this.getDate(nextMoment)
					});
				}
			},
			// 日期选择鼠标悬浮函数
			hoverDay(data, itemMonth, itemYear){
				if(this.isRanging && this.rangeStart){
					var dataStr = this.formatString(data.year, data.month + 1, data.data);
					if(this.rangeStart.isAfter(dataStr)){
						this.hoveringStart = moment(dataStr);
						this.hoveringEnd = this.rangeStart;
					}else{
						this.hoveringEnd = moment(dataStr);
						this.hoveringStart = this.rangeStart;
					}
				}
			},
			// 是否是起始日期
			isStart(data){
				var dataStr = this.formatString(data.year, data.month + 1, data.data);
				return this.rangeStart ? this.rangeStart.isSame(dataStr, 'date') : false;
			},
			// 是否是结束日期
			isEnd(data){
				var dataStr = this.formatString(data.year, data.month + 1, data.data);
				return this.rangeEnd ? this.rangeEnd.isSame(dataStr, 'date') : false;
			},
			// 点击日期
			clickDay(data, itemMonth, itemYear){
				if(this.isDisabled(data)){
					return
				}
				// 范围选择
				if(this.range){
					var dataStr = this.formatString(data.year, data.month + 1, data.data);
					// 已经选择了范围段，再点击日期的话，重置范围
					if(this.rangeEnd && !this.isRanging){
						this.isRanging = true;
						this.rangeEnd = null;
						this.hoveringEnd = null;
						this.hoveringStart = null;
						this.rangeStart = moment(dataStr);
						return;
					}
					// 没有起始段，设置起始段，标记正在选择范围
					if(!this.rangeStart){
						this.rangeStart = moment(dataStr);
						this.isRanging = true;
					}else if(this.rangeStart.isAfter(dataStr)){
						this.rangeEnd = this.rangeStart;
						this.rangeStart = moment(dataStr);
						this.isRanging = false;
					}else if(!this.rangeEnd){
						this.isRanging = false;
						this.rangeEnd = moment(dataStr);
						if(this.rangeStart.isSame(this.rangeEnd, 'date')){
							this.hoveringEnd = this.rangeStart;
							this.hoveringStart = this.rangeEnd;
						}
					}else if(this.rangeStart.isSame(dataStr, 'date')){
						this.rangeStart = null;
						this.isRanging = false;
						this.rangeStart = null;
						this.rangeEnd = null;
					}else{
						this.rangeEnd = moment(dataStr);
						this.isRanging = false;
					}
					if(!this.confirm && this.rangeEnd && this.rangeStart){
						this.showDate = false;
					}
					return;
				}
				// 多选
				if(this.multiple){
					var index = this.containsData(data, this.activeDates);
					if(index > -1){
						this.activeDates.splice(index , 1);
					}else{
						this.activeDates.push(data);
					}
				}else{// 单选
					this.activeDates.splice(0, 1, data);
				}
				if(!this.confirm){
					this.clickOk();
					this.$emit('input', this.formatDates(this.activeDates));
				}
				
				if(!this.confirm){
					this.showDate = false;
				}
				// 是否切换日期，注意范围选择的时候切换日期需要点击切换月份或者年份
				if(itemMonth != data.month || itemYear != data.year){
					this.initDate(moment(data.year + '-' + (data.month + 1), 'YYYY-MM')._d);
				}
			},
			// 是否为今天
			isToday(data){
				return data.year === this.today.year() && data.data === this.today.date() && data.month === this.today.month();
			},
			// 是否包含日期，根据年、月、日来确定
			containsData(data, list){
				var index = list.findIndex((item)=>{
					return item.data === data.data && item.month === data.month && item.year === data.year;
				});
				return index;
			},
			// 是否是hover范围的
			isHover(data){
				if(!this.hoveringStart || !this.hoveringEnd){
					return false;
				}
				var str = this.formatString(data.year, data.month + 1, data.data);
				if(moment(str).isBetween(this.hoveringStart.clone().add(-1, 'days'), this.hoveringEnd.clone().add(1, 'days'), 'date')){
					return true;
				}
				return false;
			},
			// 是否是激活，选择
			isActive(data){
				var index = this.containsData(data, this.activeDates);
				return index > -1 ? true : false;
			},
			// 初始化函数
			init(){
				this.today = moment(this.currentDate);
				this.initDate(this.currentDate);
				this.changeVal(this.value);
				var vm = this;
				// mask效果
				$(document).on('click', function(e){
					var target = e.target;
					var $parent = $(target).parents('.x-date-picker');
					if(vm.maskClick 
						&& (target !== vm.$el && !$parent.length || $parent[0] !== vm.$el)){
						vm.showDate = false;
						e.preventDefault();
						e.stopImmediatePropagation();
						e.stopPropagation();
					}
				})
			}
		},
		mounted(){
			this.init();
		}
	}
</script>

<style lang="less" scoped>
// 最外层样式
.x-date-picker{
	position: relative;
	font-size: 12px;
	// 输入框
	input[type=text].date-input{
		width: 100%;
		height: 36px;
		padding-right: 30px;
	}
	// 输入框旁边的图标
	.calendar-ico{
		position: absolute;
		top: 8px;
		height: 8px;
		font-size: 20px;
		right: 8px;
	}
	// 范围选择样式
	&.range-type{
		.date-picker-item:first-child{
            .next-btn{
            	display: none;
            }
            .week-title{
				border-top: 1px solid #ddd;
				border-bottom: 1px solid #ddd;
				border-right: 1px solid #ddd;
				border-left: 0;
			}
        }
		.date-picker-item:last-child{
            .prev-btn{
            	display: none;
            }
            .week-title{
				border-top: 1px solid #ddd;
				border-bottom: 1px solid #ddd;
				border-right: 0;
				border-left: 1px solid #ddd;
			}
        }
		// 定死宽度，不然会被挤下去
        .date-picker-wrapper{
        	min-width: 604px;
        }
	}
}
// 日期选择部分
.date-picker-wrapper{
	box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.4);
	z-index: 40;
    font-size: 12px;
    color: #333;
    background-color: #fff;
    display: none;
    overflow: hidden;
    position: absolute;
    min-width: 296px;
    border-bottom: 1px solid #ddd;
    // 激活状态
    &.active{
    	display: block;
    }
	// 头部，快捷
    .date-picker-header{
        padding: 20px;
        background-color: #f0f4f5;
    }
    .recent-item{
        display: inline-block;
        height: 24px;
        width: 70px;
        margin-right: 10px;
        border: 1px solid #ddd;
        text-align: center;
        line-height: 24px;
        cursor: pointer;
        &.active{
            background-color: #2dacfd;
            color: #fff;
            border-color: #2dacfd;
        }
    }
    .date-picker-item{
        width: 296px;
        float: left;
        margin-right: 12px;
    }
    .date-picker-container{
    	border-top: 1px solid #ddd;
    	&:before,
    	&:after{
    		content: "";
    		clear: both;
    		display: block;
    	}
        .date-picker-item:last-child{
            margin-right: 0;
        }
    }
    .date-picker-title{
        height: 25px;
        text-align: center;
        line-height: 25px;
        position: relative;
    }
    .year-btn{
        height: 25px;
        width: 23px;
        position: absolute;
        cursor: pointer;
        background-position: center;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        top: 0;
        &.prev-btn{
            left: 0;
            background-image: url(./year-prev.png);
        }
        &.next-btn{
            right: 0;
            background-image: url(./year-next.png);
        }
    }
    .week-title{
    	background-color: #f0f4f5;
		&:before,
		&:after{
    		content: "";
    		clear: both;
    		display: block;
    	}
    }
    .week-wrapper{
    	float: left;
    	width: 42px;
    	height: 30px;
    	line-height: 30px;
    }
    .date-picker-week{
        position: relative;
        overflow: hidden;
        margin-bottom: 10px;
    }
    .month-btn{
        position: absolute;
        width: 24px;
        background-size: contain;
        background-repeat: no-repeat;
        cursor: pointer;
        top: 0;
        height: 30px;
        &.prev-btn{
            left: -6px;
            background-position: left center;
            background-image: url(./month-prev.png);
        }
        &.next-btn{
            right: -6px;
            background-position: right center;
            background-image: url(./month-next.png);
        }
    }
    
	.not-current, .disabled{
		color: #999;
	}
	

    .week-day{
        text-align: center;

    }
    .date-picker-day{
        .day{
            position: relative;
            width: 24px;
            height: 24px;
            text-align: center;
            line-height: 24px;
            cursor: pointer;
            display: inline-block;
        }
        .disabled{
		 	.day{
				cursor: not-allowed;
		 	}
		}
		// 日期部分
        .day-wrapper{
        	float: left;
            width: 42.25px;
            height: 24px;
            position: relative;
            margin-bottom: 10px;
            overflow: hidden;
            // flex-grow: 1;
            text-align: center;
            &.today{
        		.day{
	        		border-radius: 50%;
	        		background: #fff;
	        		color: #5eb6e4;
	        		border: 1px solid #5eb6e4;
	        	}
	        	&.active{
	        		.day{
	        			border-radius: 50%;
		        		background: #fff;
		        		color: #5eb6e4;
	        		}
	        	}
        	}
            &.active{
                .mark-block{
                	background-color: #5eb6e4;
                }
                .day{
                	color: #fff;
                }
            }
            &.start{
	        	.day{
	        		border-radius: 50%;
	        		background: #fff;
	        		color: #5eb6e4;
	        		border: 1px solid #5eb6e4;
	        	}
	        	.mark-block{
	        		border-bottom-left-radius: 16px;
	        		border-top-left-radius: 16px;
	        		margin-left: 9px;
	        	}
        	}
        	&.end{
	        	.day{
	        		border-radius: 50%;
	        		background: #fff;
	        		color: #5eb6e4;
	        		border: 1px solid #5eb6e4;
	        	}
	        	.mark-block{
	        		border-bottom-right-radius: 16px;
	        		border-top-right-radius: 16px;
	        		margin-left: -9px;
	        	}
        	}
        	&.start.end{
        		.mark-block{
				    margin-left: 0;
	        	}
        	}
        	
        }
        .mark-block{
        	position: absolute;
        	width: 100%;
        	height: 100%;
        	top: 0;
        	left: 0;
        }

    }

    .date-picker-footer{
    	height: 60px;
    	background: #fbfbfb;
    	padding: 0 16px;
        .date-picker-btn{
            cursor: pointer;
            width: 80px;
            height: 32px;
            float: right;
            margin-top: 14px;
            line-height: 32px;
            text-align: center;
            border-radius: 2px;
            background: #2dacfd;
            color: #fff;
        }
    }

}
</style>