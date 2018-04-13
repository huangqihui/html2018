/**
 * @author mrdoob / http://mrdoob.com/
 */

var Importer = function () {

	var scope = this;

	this.texturePath = '';

	this.importFile = function (file ) {

		var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();

		switch ( extension ) {

			case 'terrain':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

				    var bytes = [];

				    var dv = new DataView(event.target.result);

				    var len = dv.byteLength;

				    for (var i = 0; i < len; ++i) {

				        bytes.push(dv.getUint8(i));

                    }

                    swfobject.getObjectById("MapConfigData").unCompress(bytes);


				}, false );
				reader.readAsArrayBuffer( file );

				break;

            case 'jpg':
            case 'png':

                var reader = new FileReader();
                reader.addEventListener( 'load', function ( event ) {

                    $("#mapImg").attr("src", event.target.result);
                    mapName = filename;

                }, false );
                reader.readAsDataURL(file);
                break;

			default:

				alert( "编辑器只支持打开【.terrain文件】和【图片(jpg|png)文件】");

				break;

		}

	}
}



