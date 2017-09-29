<template>
	<div class="bbk-options">
		<div class="label">
			{{label}}
		</div>
		<div 
			class="option item" 
			:class="{active: infinite}" 
			@click="setItem(null, -1)">{{infiniteLabel}}</div>
		<div 
			class="option item"
			:class="{active: item.active}" 
			v-if="recentItems.length" 
			@click="removeItem(item)"
			v-for="item in recentItems">
			{{item[nameKey]}}
		</div>
		<div class="option item more" v-show="recentItems.length >= 5 && items.length > 5 || checkMore() " @click="showSelector">...</div>
		<div class="option item open-option" :class="{open: openState}">
			<div class="label" @click="showSelector">{{moreLabel}}</div>
			<div 
			class="option-selector"
			ref="selector"
			:class="{'show-more': showMore}">
				<div class="select-header">
					<h3 class="select-title">
						{{title}} 
						<input type="text" @input="search($event)" :placeholder="searchPlaceholder">
					</h3>
					<div class="select-quick-position">
						快速浏览：
						<div 
						class="quick-position-item" 
						v-for="(labelItem, index) in list" 
						@click="scrollLabel(labelItem[labelKey])"
						:key="index">
							{{labelItem[labelKey]}}
						</div>
					</div>
				</div>
				<div class="select-body-wrapper">
					<div class="select-body clearfix">
						<div class="select-item-group clearfix" v-for="(opt, index) in list" :key="index">
							<div 
							:data-scroll="opt[labelKey]"
							class="select-item-label clearfix" 
							v-if="showDataLabel">
								<span class="label-name">{{opt[labelKey]}}</span>
							</div>
							<div class="item-group">
								<div class="select-item" 
									:class="{active: mdata.active}"
									v-for="mdata in opt[dataKey]" 
									:key="mdata[valueKey]" 
									:title="mdata[nameKey]"
									@click="setItem(mdata)"
									:data-value="mdata[valueKey]">
									{{mdata[nameKey]}}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="block-height"></div>
				<div class="select-footer table-display">
					<div class="footer-btn table-cell">
						<!-- <div class="select-footer-btn cancle" @click="footerClick(0)">取消</div> -->
						<div class="select-footer-btn ok " @click="footerClick(1)">确定</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script type="text/javascript">
	export default {
	name: 'selector',
	data: function(){
		return {
			items: [],
			recentItems: [],
			templateItems: [],
			searching: false,
			infinite: false,
			openState: false
		}
	},
	computed: {
		selectedItem: function(){
			return this.items.slice(0, 5);
		}
	},
	watch: {
		show: function(val){
			this.openState = val;
		},
		items: function(val){
			if(val && val.length){
				this.infinite = false;
			}else{
				this.infinite = true;
			}
		},
		list: function(val, oldVal){
			//先设置值，再清空
			this.setVal(this.value);
			this.clear();
		},
		value: function(val){
			if(val && val.length){
				this.setVal(val);
			}else{
				// this.recentItems = [];
				this.setVal(val, true);
			}
		}
	},
	props: {
		//不限标签
		infiniteLabel: {
			type: String,
			default: '不限'
		},
		//设置一个name，用来标记多个筛选器
		name: {
			type: String,
			default: ''
		},
		//不限的标签值
		inifiniteValue: {
			type: [Number, String],
			default: -1
		},
		//初始化值，用于v-model
		value: {
			type: Array,
			default: function(){
				return [];
			}
		},
		//选择器的title部分
		title: {
			type: String,
			default: '选择器'
		},
		//显示更多，搜索，快速定位
		showMore: {
			type: Boolean,
			default: false
		},
		//搜索placeholder
		searchPlaceholder: {
			type: String,
			default: '搜索...'
		},
		//列表，格式： 
		/*[{
			label: 'asss',
			data: [{
				name: 'asd',
				value: 1232
			}]
		}]*/
		list: {
			type: [Array, Object],
			required: true
		},
		//list中的name字段
		nameKey: {
			type: String,
			default: 'name'
		},
		//显示标签
		showDataLabel: {
			type: Boolean,
			default: true
		},
		//list中的value字段
		valueKey: {
			type: String,
			default: 'value'
		},
		//list中的data字段
		dataKey: {
			type: String,
			default: 'data'
		},
		//list中的label字段
		labelKey: {
			type: String,
			default: 'label'
		},
		//标签
		label: {
			type: String,
			required: true,
			default: ''
		},
		//更多标签的名称
		moreLabel: {
			type: String,
			default: '更多'
		},
		//是否多选
		multiple: {
			type: Boolean,
			default: true
		}
	},
	methods: {
		clear: function(){
			// this.recentItems = [];
			// this.items = [];
			this.$emit('input', $.extend([], this.items), this.name);
		},
		//显示选择器
		showSelector: function(e){
			//将所有的选择器z-index设置小一点
			$('.option-selector').css('z-index', 999);
			//当前的z-index设置大一点
			var $selector = $(this.$refs.selector).css('z-index', 1000);

			//开始计算位置
			var $this = $(e.target);
			var offset = $this.offset();
			var height = $this.height();
			var width = $this.width();
			var left = (offset.left) + 'px';
			var top = (offset.top + height) + 'px';
			//510是选择器的宽度
			if(window.innerWidth - offset.left < 510){
				left = (window.innerWidth  - 510) + 'px';
			}
			//450是选择器的高度
			if(window.innerHeight - offset.top < 450){
					top = (window.innerHeight - 450) + 'px';
			}
			$selector.css({
				left: left,
				top: top
			});
			//切换显示状态
			this.openState = !this.openState;
			//如果是消失状态，清除，取消当前的选择
			if(!this.openState && this.templateItems.length){
				this.emitSelected(true);
			}
		},
		resetRecentItem: function(){
			var outOfList = [];
			for(var i = 0, len2 = this.recentItems.length; i < len2; i++){
				var mitem = this.getItem(this.recentItems[i][this.valueKey]);
				if(!mitem){
					outOfList.push(this.recentItems[i]);
				}
			}
			for(var i = 0, len2 = outOfList.length; i < len2; i++){
				var index = this.getItem(outOfList[i][this.valueKey], this.recentItems);
				if(index !== -1){
					this.recentItems.splice(index, 1);
				}
			}
			this.recentItems = this.sortData(this.recentItems);
		},
		//设置初始化的状态
		setVal: function(val, disactive){
			this.items = [];
			this.resetRecentItem();
			// this.recentItems = [];
			var len = val.length;
			for(var i = 0; i < len; i++){
				var mitem = this.getItem(val[i][this.valueKey]);
				if(mitem){
					mitem.active = true;
					var index = this.getItemIndex(mitem[this.valueKey], this.items);
					index === -1 && this.items.push(mitem);
					var rindex = this.getItemIndex(mitem[this.valueKey], this.recentItems);;
					if(this.recentItems.length < 5){
						if(rindex === -1){
							this.recentItems.push(mitem);
						}else{
							Vue.set(this.recentItems, rindex, mitem);
						}
					}
				}
			}
			if(!len){
				console.log(disactive)
				for(var i = 0, len2 = this.recentItems.length; i < len2; i++){
					var item = this.recentItems[i]
					item.active = false;
					Vue.set(this.recentItems, i, item);
				}
			}
			this.recentItems = this.sortData(this.recentItems);
		},
		//获取item
		getItem: function(value){
			for(var i = 0, len = this.list.length; i < len; i++){
				var item = this.list[i];
				if(!item[this.dataKey] || !item[this.dataKey].length){
					continue;
				}
				for(var j = 0, len2 = item[this.dataKey].length; j < len2; j++){
					var subItem = item[this.dataKey][j];
					if(subItem[this.valueKey] === value){
						return subItem
					}
				}
			}
			return null;
		},
		//初始化
		init: function(){
			var vm = this;
			this.setVal(this.value);
			if(!this.value || !this.value.length){
				this.infinite = true;
			}
			//当点击非当前选择器的区域，将当前的选择器设置隐藏
			$(document).on('click', function(e){
				var $this = $(e.target);
				//跟选择器相关的都不隐藏
				if($this.hasClass('more') || ($this.parents('.open-option').length || $this.hasClass('option item')) && $this.parents('.bbk-options')[0] === vm.$el){
					if($this.hasClass('option item') && !$this.hasClass('more')){
						vm.openState = false;
					}
					return;
				}
				if(vm.openState){
					vm.emitSelected(true);
				}
				vm.openState = false;
			});
		},
		//重置搜索
		resetSearch: function(){
			if(this.searchTd){
				return;
			}
			clearTimeout(this.searchTd);
			var vm = this;
			this.searchTd = setTimeout(function(){
				$(vm.$el).find('.flash').removeClass('flash');
				vm.searching = false;
				vm.searchTd = null;
			}, 1000);
		},
		//搜索功能
		search: function(e){
			if(this.searching){
				return;
			}
			$(this.$el).find('.flash').removeClass('flash');
			this.searching = true;
			var val = e.target.value;
			var $option = $(this.$el).find('.select-item[data-value*="'+ val +'"]');
			//查找到就返回
			if($option.length){
				$option[0].scrollIntoViewIfNeeded(true);
				$option.addClass('flash');
				this.resetSearch();
				return
			}
			var vm = this;
			$(this.$el).find('.select-item').each(function(index, el){
				if(el.innerHTML.indexOf(val) !== -1){
					$(el).addClass('flash');
					el.scrollIntoViewIfNeeded(true);
					vm.resetSearch();
					return true;
				}
			})
			//查找到label就滚动到label
			var $labelEl = $(this.$el).find('[data-scroll="'+val+'"]');
			if($labelEl.length){
				$labelEl[0].scrollIntoViewIfNeeded(true);
				$labelEl.addClass('flash');
				this.resetSearch();
				return;
			}
			this.searching = false;
		},
		//快捷移除
		removeItem: function(item){
			var index = this.getItemIndex(item[this.valueKey], this.items);
			var rindex = this.getItemIndex(item[this.valueKey], this.recentItems);
			if(item.active){
				this.items.splice(index, 1);
				item.active = false;
			}else if(index === -1){
				item.active = true;
				this.items.push(item);
			}

			//设置item.active在recent里面不生效，需要使用Vue的全局方式
			rindex !== -1 && Vue.set(this.recentItems, rindex, item);
			//最近点过的先保存，点击筛选器消失的时候用来还原
			var rtindex = this.getItemIndex(item[this.valueKey], this.recentTempItems);
			rtindex === -1 && this.recentTempItems.push(item);
			this.recentItems = this.sortData(this.recentItems);
			//置空缓存
			this.templateItems = [];
			this.$emit('input', $.extend([], this.items), this.name);
			this.$emit('ok', $.extend([], this.items), this.name);
		},
		getItemIndex: function(value, list){
			var vm = this;
			var index = list.findIndex(function(mdata){
				return mdata[vm.valueKey] === value;
			});
			return index;
		},
		//比较大小
		getMinIndex: function(data1, data2){
			if(data1.pindex < data2.pindex){
				return {
					min: data1,
					max: data2
				}
			}else if(data1.pindex > data2.pindex){
				return {
					min: data2,
					max: data1
				}
			}else if(data1.index < data2.index){
				return {
					min: data1,
					max: data2
				}
			}else{
				return {
					min: data2,
					max: data1
				}
			}
		},
		//手动排序，依据实际情况来
		sortData: function(data){
			var tempData = [];
			for(var i = 0, len = this.list.length; i < len; i++){
				var item = this.list[i];
				if(!item[this.dataKey] || !item[this.dataKey].length){
					continue
				}
				for(var j = 0, len2 = item[this.dataKey].length; j < len2; j++){
					var mindex = this.getItemIndex(item[this.dataKey][j][this.valueKey], data);
					if(mindex !== -1){
						//记录pindex和index
						tempData.push({
							dataIndex: mindex,
							pindex: i,
							index: j,
							//记录原始数据
							data: data[mindex]
						});
					}
				}
			}
			var tempArr = [];
			if(tempData.length){
				for(var i = 0, len = tempData.length; i < len; i++){
					for(var j = i + 1; j < len; j++){
						var temp = this.getMinIndex(tempData[i], tempData[j]);
						tempData[i] = temp.min;
						tempData[j] = temp.max;
					}
					tempArr.push(tempData[i].data);
				}
			}
			return tempArr;
		},
		//点击筛选器中的一项
		setItem: function(data, isInFinite){
			if(isInFinite < 0){
				this.infinite = true;
				$.each(this.items, function(index, item){
					item.active = false;
				});
				this.items = [];
				this.templateItems = [];
				this.$emit('ok', $.extend([], this.items), this.name);
				this.$emit('input', this.items, this.inifiniteValue);
				return;
			}

			this.infinite = false;
			//最近点击保存
			var rindex = this.getItemIndex(data[this.valueKey], this.recentItems);
			var index = this.getItemIndex(data[this.valueKey], this.items);
			//多选
			if(this.multiple){
				if(data.active){
					this.items.splice(index, 1);
					data.active = false;
				}else{
					data.active = true;
					this.items.push(data);
					Vue.set(this.items, this.items.length - 1, data);
				}
			}else{//单选
				if(index !== -1){
					return;
				}
				data.active = true;
				var prevData = this.items.splice(0, 1, data)[0];
				if(prevData){
					prevData.active = false;
				}
			}
			//最近的在没有点击确定的时候不进行删除，只添加
			if(rindex === -1 && this.recentItems.length < 5){
				this.recentItems.push(data);
			}else if(rindex > -1 && !data.active){
				//更新状态
				Vue.set(this.recentItems, rindex, data);
			}else{
				rindex !== -1 && Vue.set(this.recentItems, rindex, data);
			}

			var tindex = this.getItemIndex(data[this.valueKey], this.templateItems);
			if(tindex === -1){
				//临时数据保存
				this.templateItems.push(data);
				// this.recentTempItems = [];
				Vue.set(this.templateItems, this.templateItems.length - 1, data);
			}
			this.recentItems = this.sortData(this.recentItems);
		},
		//更多按钮前面的“...”是否显示
		checkMore: function(){
			var hasMore = false;
			//检查recent里面是否全部在items里面
			if(this.recentItems.length > 4){
				for(var i = 0; i < this.items.length; i++){
					var item = this.items[i];
					var index = this.getItemIndex(item[this.valueKey], this.recentItems);
					if(index === -1){
						hasMore = true;
						break;
					}
				}
				//全部在items里面，则会执行前面的条件
			}
			return hasMore;
		},
		//这里触发v-model，只是单向，因为没有监听value属性，所以只能向外
		emitSelected: function(clear){
			//清除临时选择
			var vm = this;
			if(clear){

				//最近点过的是否已经清空，是在第一次点击的时候
				var hasClearAll = false;

				//清除临时选择的项，需求需要没有点击确定按钮，筛选器消失后当前选择的无效
				$.each(this.templateItems, function(index, item){
					var sindex = vm.getItemIndex(item[vm.valueKey], vm.items);
					var rindex = vm.getItemIndex(item[vm.valueKey], vm.recentItems);

					var rtindex = vm.getItemIndex(item[vm.valueKey], vm.recentTempItems);

					if(sindex > -1){
						item.active = false;
						vm.items.splice(sindex, 1);
					}else{
						item.active = true;
						vm.items.push(item);
					}
					if(rindex > -1){
						(rtindex === -1 && !item.active) && vm.recentItems.splice(rindex, 1);
						if(vm.recentItems.length === 0){
							hasClearAll = true;
						}
					}else if(!hasClearAll && vm.recentItems.length < 5){
						vm.recentItems.push(item);
					}
				});
			}else{
				this.recentItems = this.items.slice(0, 5);
				this.recentItems = this.sortData(this.recentItems);
				//置空
				this.recentTempItems = [];
			}
			this.templateItems = [];
			this.$emit('input', $.extend([], this.items));
		},
		//筛选器的底部点击按钮，取消和确定，取消默认隐藏
		footerClick: function(type){
			this.openState = false;
			if(type === 0){
				this.emitSelected(true);
				this.$emit('cancle', $.extend([], this.items), this.name);
			}else{
				this.emitSelected();
				this.$emit('ok', $.extend([], this.items), this.name);
			}
		}
	},
	mounted: function(){
		this.init();
		this.recentTempItems = [];
	}
}
</script>
<style lang="less" scoped>
.bbk-options{
	float: left;
	z-index: 2;
	margin-bottom: 24px;
	margin-right: 80px;
	&:after，&:before{
		content: '';
		clear: both;
	}
	.option.item{
		border: 1px solid #cacaca;

		padding: 4px 20px;
		float: left;
		margin: 0;
		cursor: pointer;
		text-align: center;
		height: 30px;
		line-height: 20px;
		font-size: 12px;
		&:not(.open):not(.active):hover{
			background-color: #f5f5f5;
		}
		&.active{
			color: #fff;
			background-color: #2599ee;
			border-color: #2599ee;
			border-right: 1px solid #FFF;
		}
		&:not(:nth-child(2)){
			border-left: 0;
		}
		&.open-option{
			padding: 0;
			position: relative;
			.label{
				padding: 4px 25px 4px 15px;
				&:after{
					content: '';
					top: 0;
					right: 0;
					display: block;
					width: 25px;
					height: 25px;
					position: absolute;
					background-position: center;
					background-image: url(./arrow.png);
					background-repeat: no-repeat;
					transition: all .3s linear;
				}
				
			}

			.option-selector{
				z-index: 1000;
				margin-top: 8px;
				position: fixed;
				background-color: #fff;
				display: none;
				text-align: initial;
				padding: 0;
			    box-shadow: 0px 5px 6px 0px rgba(0, 0, 0, 0.1);
				overflow: hidden;
				font-size: 12px;
				margin-left: -1px;
				border: 1px solid #c8c8c8;
				.select-quick-position{
					display: none;
				}
				.select-title{
					font-size: 12px;
					font-weight: bold;
					color: #666;
					input[type="text"]{
						display: none;
					}
				}
				.select-body-wrapper{
					max-height: 300px;
					position: relative;
					overflow-y: auto;
					overflow-x: hidden;
					.select-body{
						padding: 0 24px;
						width: 438px;
						
						.select-item-label{
							position: relative;
							border-bottom: 1px solid #ddd;
							margin-bottom: 12px;
							.label-name{
								border-bottom: 2px solid #2dacfd;
								float: left;
								display: inline-block;
								font-size: 12px;
								color: #333;
								font-weight: bold;
							}
						}
						.select-item-group{
							float: left;
							width: 390px;
							margin-bottom: 24px;
							&:last-child{
								margin-bottom: 0;
							}
							.item-group{
								.select-item{
									box-sizing: border-box;
									margin-bottom: 10px;
									margin-right: 10px;
									margin-left: 0;
									cursor: pointer;
									border: 1px solid;
									display: inline-block;
									transition: all .3s linear;
									width: 70px;
									height: 24px;
									line-height: 24px;
									text-align: center;
									white-space: nowrap;
									overflow: hidden;
									float: left;
									font-size: 12px;
									text-overflow: ellipsis;
									border: 1px solid #ddd;
									color: #666666;
									&:hover{
										background-color: #f5f5f5;
									}
									&.active{
										color: #fff;
										background-color: #5eb6e4;
										border-color: #5eb6e4;
									}
									&:nth-child(5n){
										margin-right: 0;
									}
									&:nth-child(6n){
										margin-left: 0;
									}
								}
							}
						}
					}
				}
				.select-header{
					background-color: #fff;
					top: 0;
					left: 0;
					padding: 24px;
					line-height: 1;
					width: 100%;
				}
				.block-height{
					height: 10px;
					width: 100%;
				}
				.select-footer{
					padding: 10px;
					background-color: #fbfbfb;
					height: 60px;
					bottom: 0;
					left: 0;
					width: 100%;
					text-align: right;
					.footer-btn{
						text-align: right;
					}
					.select-footer-btn{
						font-size: 14px;
						cursor: pointer;
						display: inline-block;
						background-color: #2dacfd;
						color: #fff;
						width: 80px;
						height: 32px;
						line-height: 32px;
						border-radius: 2px;
						margin-right: 20px;
						text-align: center;
						&:hover{
							background-color: #2599ee;
						}
					}
				}
				&.show-more{
					.select-title{
						line-height: 30px;
						margin-bottom: 10px;
						input[type="text"]{
							display: inline-block;
							line-height: 24px;
							float: right;
						}
					}
					.select-quick-position{
						display: block;
						height: 36px;
						padding: 0 10px;
						background-color: #eee;
						.quick-position-item{
							display: inline-block;
							cursor: pointer;
							padding: 4px 20px;
							color: #fff;
							margin: 5px;
							background-color: #2599ee;
						}
					}
				}
			}
			&.open{
				.label:after{
					transform: rotate(180deg);
				}
				.option-selector{
					display: block;
				}
			}

		}
	}
	& > .label{
		float: left;
		margin-right: 12px;
		height: 30px;
		line-height: 30px;
		display: inline-block;
	}
}
</style>