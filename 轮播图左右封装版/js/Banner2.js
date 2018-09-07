window.Banner = function (id, url, duration, interval) {
    //this Banner的实例
    //都用类名获取方便插件的多次引用
    this.outer = document.getElementsByClassName(id)[0];
    this.swiper = this.outer.getElementsByClassName("swiper")[0];
    this.focus = this.outer.getElementsByClassName("focus")[0];
    this.imgs = this.outer.getElementsByTagName("img");
    this.lis = this.focus.getElementsByTagName("li");
    this.left = this.outer.getElementsByClassName("left")[0];
    this.right = this.outer.getElementsByClassName("right")[0];
    this.data = null;
    this.timer = null;
    this.step = 0;
    //isClick解决鼠标多次点击的问题
    this.isClick = true;
    this.url = url;
    //时间间隔要大于运动时间
    if (duration > interval) [duration, interval] = [interval, duration];
    this.duration = duration || 1000;
    this.interval = interval || 2000;

    //解决浏览器最小化后图片轮播速度叠加的问题
    document.addEventListener("visibilitychange",() =>{
        if(document.visibilityState=="hidden"){
            clearInterval(this.timer);
        }else {
            //单例模式可以不加
            clearInterval(this.timer);
            this.timer = setInterval(() => {
                this.autoMove();
            }, this.interval);
        }
    })

};

//获取数据
Banner.prototype.ajax = function () {

    let xhr = new XMLHttpRequest();
    xhr.open("GET", this.url, false);
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            this.data = JSON.parse(xhr.responseText);
        }
    };
    xhr.send(null);

};

//绑定数据
Banner.prototype.bindHTML = function () {
    //this:当前实例
    let imgStr = ``, liStr = ``;
    for (let i = 0; i < this.data.length; i++) {
        imgStr += `<div><img data-src="img/${this.data[i].src}" alt=""></div>`;
        liStr += ` <li class="${i == 0 ? 'select' : ''}"></li>`;
    }
    imgStr += `<div><img data-src="img/${this.data[0].src}" alt=""></div>`;
    this.swiper.innerHTML = imgStr;
    this.focus.innerHTML = liStr;
    //第一次写的时候1后面的实例无法使用，原因是utils中的setCss判定有问题
    //外部盒子宽度浮动，加几张图片都可以
    utils.css(this.swiper, 'width', this.outer.offsetWidth * (this.data.length + 1));
    this.lazyImg();


};
Banner.prototype.lazyImg=function() {
    for (let i = 0; i < this.imgs.length; i++) {
        let cur = this.imgs[i];
        let oImg = new Image();
        let url = cur.getAttribute('data-src');
        oImg.src = url;
        oImg.onload = function () {
            cur.src = this.src;
            oImg = null;
            animate(cur, {opacity: 1}, 2000);
        }
    }

};

Banner.prototype.auto=function() {
    let that=this;
    //这个地方还可以是哟个箭头函数来解决this指向问题
    this.timer = setInterval(that.autoMove.bind(that),  that.interval);
    return this;
};
Banner.prototype.autoMove=function() {
let that=this;
    if (this.step >= this.data.length) {
        this.step = 0;
        utils.css(this.swiper, 'left', 0);
    }
    this.step++;
    animate(that.swiper, {left: this.step * -1000}, that.duration, function () {
        that.isClick = true;
    });
    this.focusTip();


};

Banner.prototype.mouseMove=function(){
    let that=this;
    this.outer.onmouseenter = function () {
        clearInterval(that.timer);
        utils.css(that.left, 'display', 'block');
        utils.css(that.right, 'display', 'block');
    };
        this.outer.onmouseleave = function () {
            //用于清除遗留的定时器，防止速度叠加
            clearInterval(that.timer);
        that.timer = setInterval(that.autoMove.bind(that), that.interval);
        utils.css(that.left, 'display', 'none');
        utils.css(that.right, 'display', 'none');
    };
    return this;
};
Banner.prototype.focusClick=function() {
    let that=this;
    for (let i = 0; i < this.lis.length; i++) {
        this.lis[i].onclick = function () {
            that.step = i - 1;
            that.autoMove()
        }
    }
    return this;

};
Banner.prototype.focusTip=function () {
    for (let i = 0; i < this.lis.length; i++) {
        if (this.step === i) {
            this.lis[i].classList.add('select');
        } else {
            this.lis[i].classList.remove('select');
        }
        if (this.step ===this.data.length) {
            this.lis[0].classList.add('select');
        }
    }

};
 Banner.prototype.buttonClick=function(){
    let that=this;
    this.right.onclick = function () {
        if (that.isClick) {
            that.isClick = false;
            that.autoMove();

        }

    };
    this.left.onclick = function () {

        if (that.isClick) {
            that.isClick = false;
            if (that.step <= 0) {

                that.step = that.data.length;

                utils.css(that.swiper, 'left', -1000 * that.step);

            }

            that.step--;
            that.focusTip();
            animate(that.swiper, {left: -1000 * that.step}, that.duration, function () {
                that.isClick = true;
            });
        }

    };
     return this;
};

Banner.prototype.init = function () {
    //this:当前实例
    this.ajax();
    this.bindHTML();
    return this;
};
//点击左箭头图片轮播，焦点不变换
//鼠标划入之后自动林波函数不执行
//鼠标划出后，函数不继续执行


