if (window.Cbn === undefined) {
	window.Cbn = {};
}
Cbn.cropper = {
	properties: {
		aspectRatio: {
			type: Number,
			value: 1
		},
		dragMode:{
			type: String,
			value: "move"
		},
		minCropBoxHeight:{
			type: Number,
			value: 50
		},
		/**
		 * https://github.com/fengyuanchen/cropperjs#autocroparea
		 * A number between 0 and 1. Define the automatic cropping area size (percentage).
		 */
		autoCropArea:{
			type: Number,
			value: 1
		},
		image:{
			type: Object,
			value: function(){
				return this.$.image;
			}
		}
	},
	
	ready: function(){
		this.cropper = new Cropper(this.image, {
			aspectRatio: this.aspectRatio,
			dragMode: this.dragMode,
			minCropBoxHeight: this.minCropBoxHeight,
			autoCropArea: this.autoCropArea
		});
	},
	zoomIn: function(){
		this.cropper.zoom(0.1);
	},
	zoomOut:function(){
		this.cropper.zoom(-0.1);
	},
	fit: function () {
		var container = this.cropper.getContainerData();
		this.cropper.setCropBoxData({
			width: container.width,
			height: container.height,
			top: 0,
			left: 0
		});
		this.cropper.setCropBoxData({
			width: this.cropper.getCropBoxData().width,
			height: this.cropper.getCropBoxData().height,
			top: parseInt((container.height - this.cropper.getCropBoxData().height) / 2),
			left: parseInt((container.width - this.cropper.getCropBoxData().width) / 2)
		});
		this.cropper.setCanvasData({
			width: container.width,
			height: container.height,
			top: 0,
			left: 0
		});
		this.cropper.setCanvasData({
			width: this.cropper.getCanvasData().width,
			height: this.cropper.getCanvasData().height,
			top: parseInt((container.height - this.cropper.getCanvasData().height) / 2),
			left: parseInt((container.width - this.cropper.getCanvasData().width) / 2)
		});
	},
	contain: function () {
		var container = this.cropper.getContainerData();
		this.cropper.setCropBoxData({
			width: container.width,
			height: container.height,
			top: 0,
			left: 0
		});
		this.cropper.setCropBoxData({
			width: this.cropper.getCropBoxData().width,
			height: this.cropper.getCropBoxData().height,
			top: parseInt((container.height - this.cropper.getCropBoxData().height) / 2),
			left: parseInt((container.width - this.cropper.getCropBoxData().width) / 2)
		});
		var cropperWidth = this.cropper.getCropBoxData().width;
		var cropperHeight = this.cropper.getCropBoxData().height;
		var imageWidth = this.cropper.getCanvasData().naturalWidth;
		var imageHeight = this.cropper.getCanvasData().naturalHeight;
		var ratio = Math.max(imageHeight / cropperHeight, imageWidth / cropperWidth);
		this.cropper.setCanvasData({
			width: imageWidth / ratio,
			height: imageHeight / ratio,
			top: parseInt((container.height - (imageHeight / ratio)) / 2),
			left: parseInt((container.width - (imageWidth / ratio)) / 2)
		});
	},
	rotateLeft: function () {
		this.cropper.rotate(-45);
	},
	rotateRight: function () {
		this.cropper.rotate(45);
	},
	flipHorizontal: function(){
		this.cropper.scaleX(-1 *this.cropper.getData().scaleX);
	},
	flipVertical: function(){
		this.cropper.scaleY(-1 *this.cropper.getData().scaleY);
	},
	generateFile: function(callback){
		this.cropper.getCroppedCanvas().toBlob(function (blob) {
			this.file=blob;
			if(typeof callback === "function"){
				callback(blob);
			}
		}.bind(this));
	}
	/*
	TODO: add interaction with keyboard
	switch (e.keyCode) {
	 case 37:
	 preventDefault(e);
	 cropper.move(-1, 0);
	 break;

	 case 38:
	 preventDefault(e);
	 cropper.move(0, -1);
	 break;

	 case 39:
	 preventDefault(e);
	 cropper.move(1, 0);
	 break;

	 case 40:
	 preventDefault(e);
	 cropper.move(0, 1);
	 break;
	 }
	 */
};
