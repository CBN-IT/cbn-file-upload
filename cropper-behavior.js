if (window.Cbn === undefined) {
	window.Cbn = {};
}
Cbn.cropper = {
	properties: {
		imageWidth: {
			type: Number,
			value: 100
		},
		imageHeight: {
			type: Number,
			value: 100
		},
		aspectRatio: {
			type: Number,
			computed:"_computeAspectRatio(imageWidth, imageHeight)"
		},
		dragMode: {
			type: String,
			value: "move"
		},
		minCropBoxHeight: {
			type: Number,
			value: 50
		},
		/**
		 * https://github.com/fengyuanchen/cropperjs#autocroparea
		 * A number between 0 and 1. Define the automatic cropping area size (percentage).
		 */
		autoCropArea: {
			type: Number,
			value: 1
		},
		image: {
			type: Object,
			value: function () {
				return this.$.image;
			}
		}
	},

	ready: function () {
		this.cropper = new Cropper(this.image, {
			aspectRatio: this.aspectRatio,
			dragMode: this.dragMode,
			minCropBoxHeight: this.minCropBoxHeight,
			autoCropArea: this.autoCropArea
		});
	},
	zoomIn: function () {
		this.cropper.zoom(0.1);
	},
	zoomOut: function () {
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
	flipHorizontal: function () {
		this.cropper.scaleX(-1 * this.cropper.getData().scaleX);
	},
	flipVertical: function () {
		this.cropper.scaleY(-1 * this.cropper.getData().scaleY);
	},
	generateFile: function (callback) {
		this.cropper.getCroppedCanvas({
			width: this.imageWidth,
			height: this.imageHeight,
			fillColor: "white"
		}).toBlob(function (blob) {
			this.file = blob;
			if (typeof callback === "function") {
				callback(blob);
			}
		}.bind(this));
	},
	_computeAspectRatio: function () {
		return parseFloat(this.imageWidth) / parseFloat(this.imageHeight);
	},
	_removeBlanksFromImage: function (context, canvas, imgWidth, imgHeight, callback) {
		var imageData = context.getImageData(0, 0, imgWidth, imgHeight),
			data = imageData.data,
			getRBG = function (x, y) {
				var offset = imgWidth * y + x;
				return {
					red: data[offset * 4],
					green: data[offset * 4 + 1],
					blue: data[offset * 4 + 2],
					opacity: data[offset * 4 + 3]
				};
			},
			isWhite = function (rgb) {
				// many images contain noise, as the white is not a pure #fff white
				return rgb.opacity<25 || rgb.red > 225 && rgb.green > 225 && rgb.blue > 225;
			},
			scanY = function (fromTop) {
				var offset = fromTop ? 1 : -1;

				// loop through each row
				for (var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {

					// loop through each column
					for (var x = 0; x < imgWidth; x++) {
						var rgb = getRBG(x, y);
						if (!isWhite(rgb)) {
							return y;
						}
					}
				}
				return null; // all image is white
			},
			scanX = function (fromLeft) {
				var offset = fromLeft ? 1 : -1;

				// loop through each column
				for (var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {

					// loop through each row
					for (var y = 0; y < imgHeight; y++) {
						var rgb = getRBG(x, y);
						if (!isWhite(rgb)) {
							return x;
						}
					}
				}
				return null; // all image is white
			};

		var cropTop = scanY(true),
			cropBottom = scanY(false),
			cropLeft = scanX(true),
			cropRight = scanX(false),
			cropWidth = cropRight - cropLeft,
			cropHeight = cropBottom - cropTop;
		var $croppedCanvas = document.createElement("canvas");
		$croppedCanvas.setAttribute("width", cropWidth+"");
		$croppedCanvas.setAttribute("height", cropHeight+"");
		// finally crop the guy
		$croppedCanvas.getContext("2d").drawImage(canvas,
			cropLeft, cropTop, cropWidth, cropHeight,
			0, 0, cropWidth, cropHeight);
		$croppedCanvas.toBlob(function (blob) {
			callback(URL.createObjectURL(blob));
		});
	},
	_reset: function (file) {
		if (this.cropper && file) {
			if (/^image\/\w+/.test(file.type)) {
				var blobURL = URL.createObjectURL(file);
				this._resetCropper(blobURL);
				this.$.fileInput.value = null;
				this.$.confirmSaving.open();
			} else {
				window.alert('Please choose an image file.');
			}
		}
	},
	cropWhitespace: function(){
		var img = this.image;
		var imgWidth = img.width;
		var imgHeight = img.height;
		var canvas = document.createElement("canvas");
		canvas.setAttribute("width", imgWidth + "");
		canvas.setAttribute("height", imgHeight + "");
		var context = canvas.getContext("2d");
		context.drawImage(img, 0, 0);
		URL.revokeObjectURL(img.src);
		this._removeBlanksFromImage(context, canvas, imgWidth, imgHeight, this._resetCropper.bind(this));
	},
	_resetCropper:function (url) {
		this.cropper.reset().replace(url);
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





