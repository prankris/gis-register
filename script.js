var map, toolbar;
var details = {};
var ParcelID;
var singleParcel;
var type;
var graphicdata1;
var landusearray = [];

require([
    "esri/basemaps",
    "esri/map",
    "esri/layers/LabelClass",
    "esri/layers/FeatureLayer",
    "esri/dijit/BasemapGallery",
    "esri/dijit/Scalebar",
    "esri/geometry/webMercatorUtils",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/ArcGISImageServiceLayer",
    "esri/dijit/Legend",
    "esri/dijit/LayerList",
    "esri/dijit/Measurement",
    "esri/dijit/Print", "esri/tasks/PrintTask", "esri/tasks/PrintTemplate",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/renderers/SimpleRenderer",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/symbols/TextSymbol",
    "esri/symbols/Font",
    "esri/tasks/BufferParameters",
    "esri/tasks/GeometryService",
    "esri/geometry/geometryEngine",
    "esri/tasks/DistanceParameters",
    "esri/layers/GraphicsLayer",
    "esri/geometry/normalizeUtils",
    "esri/units",
    "esri/Color",
    "esri/graphic",
    "esri/arcgis/utils",
    "dojo/query",
    "dojo/_base/array",
    "dijit/registry",
    "esri/toolbars/draw",
    "dojo/on",
    "dojo/dom-attr", "dojo/dom",
    "dojo/domReady!"
], function(esriBasemaps, Map, LabelClass, FeatureLayer, BasemapGallery, Scalebar, webMercatorUtils, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, Legend, LayerList, Measurement, Print, PrintTask, PrintTemplate, QueryTask, Query, SimpleFillSymbol, SimpleLineSymbol, SimpleRenderer, Polyline, Point, TextSymbol, Font, BufferParameters, GeometryService, geometryEngine, DistanceParameters, GraphicsLayer, normalizeUtils, units, Color, Graphic, arcgisUtils, query, arrayUtils, registry, Draw, on, domAttr, dom) {


    esriBasemaps.delorme = {
        baseMapLayers: [{ url: "https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho2018/ImageServer" }],
        thumbnailUrl: "https://www.example.com/images/thumbnail_2014-11-25_61051.png",
        title: "Delorme"
    };


    map = new Map("viewDiv", {
        basemap: "delorme",
        center: [-89.8253, 35.2269],
        zoom: 11,
        showLabels: true,
        sliderStyle: "large"
    });

    var scalebar = new Scalebar({
        map: map,
        attachTo: "bottom-left"
    });

    var geometryService = new GeometryService("https://gis.shelbycountytn.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");

    map.on("load", initSelectionToolbar);

    function activateTool(tool) {
        map.graphics.clear();
        selectionToolbar.activate(tool);
    }



    function areaZoomer(evtObj) {
        selectionToolbar.deactivate();
        console.log(evtObj);
        if (type == "in") {
            map.setExtent((evtObj.geometry.getExtent().expand(1)), true);
        } else {
            map.setExtent((evtObj.geometry.getExtent().expand(10)), true);
        }

    }


    var segmentLength = 0; //used in measure tool to track last segment length

    var PrevM = 0; //used in measure tool to track last total measurement

    var Mtype = ''; //used to track measurement units for display

    var measurementInfo;

    measurementInfo = new Measurement({
        map: map,
        defaultAreaUnit: units.SQUARE_FEET,
        defaultLengthUnit: units.FEET
    }, "measurementWidget");
    measurementInfo.startup();

    var opened = false;

    $("#measurement").click(function() {


        if (!opened) {

            opened = true;
        } else {

            map.graphics.clear();


            opened = false;

            var measurementActiveButton = document.querySelectorAll('.esriMeasurement .esriButton.esriButtonChecked .dijitButtonNode')[0];
            if (measurementActiveButton) {
                measurementActiveButton.click();
            }
        }
    });







    measurementInfo.on("measure-end", function(evt) {

        var line = new SimpleLineSymbol();
        line.setWidth(2);
        line.setColor(new Color([230, 0, 0, 1]));


        var i;
        if (evt.toolName == "distance") {

            for (i = 0; i < evt.geometry.paths[0].length; i++) {


                if (i + 1 < evt.geometry.paths[0].length) {

                    var polylineJson = {
                        "paths": [

                        ],
                        "spatialReference": { "wkid": 102100, "latestWkid": 3857 }
                    };

                    var array = [evt.geometry.paths[0][i][0], evt.geometry.paths[0][i][1]]
                    var array1 = [evt.geometry.paths[0][i + 1][0], evt.geometry.paths[0][i + 1][1]]

                    var array2 = [array, array1];



                    polylineJson.paths.push(array2);

                    var polyline = new Polyline(polylineJson);
                    var graphic1 = new Graphic(polyline, line);
                    map.graphics.add(graphic1);

                    var geometry1 = new Point(evt.geometry.paths[0][i][0], evt.geometry.paths[0][i][1], new esri.SpatialReference({ "wkid": 102100, "latestWkid": 3857 }));
                    var geometry2 = new Point(evt.geometry.paths[0][i + 1][0], evt.geometry.paths[0][i + 1][1], new esri.SpatialReference({ "wkid": 102100, "latestWkid": 3857 }));







                    // var theLayer = new GraphicsLayer();





                    var pnt = polyline.getExtent().getCenter();
                    var txtSym = new TextSymbol((geometryEngine.geodesicLength(polyline, 'feet')).toFixed(1) + "ft");
                    var font = new Font();
                    font.setStyle(Font.STYLE_OBLIQUE);
                    font.setWeight(Font.WEIGHT_BOLD);
                    font.setSize(16);
                    txtSym.setOffset(0, 10);
                    txtSym.setHorizontalAlignment("justify");
                    txtSym.setColor(new Color([255, 0, 0, 1]));
                    txtSym.setFont(font);

                    var lblGra = new Graphic(pnt, txtSym);

                    // theLayer.add(lblGra);



                    // map.addLayer(theLayer);

                    map.graphics.add(lblGra);






                }


            }

        } else if (evt.toolName == "area") {
            for (i = 0; i < evt.geometry.rings[0].length; i++) {


                if (i + 1 < evt.geometry.rings[0].length) {

                    var polylineJson = {
                        "paths": [

                        ],
                        "spatialReference": { "wkid": 102100, "latestWkid": 3857 }
                    };

                    var array = [evt.geometry.rings[0][i][0], evt.geometry.rings[0][i][1]]
                    var array1 = [evt.geometry.rings[0][i + 1][0], evt.geometry.rings[0][i + 1][1]]

                    var array2 = [array, array1];



                    polylineJson.paths.push(array2);

                    var polyline = new Polyline(polylineJson);
                    var graphic1 = new Graphic(polyline, line);
                    map.graphics.add(graphic1);

                    var geometry1 = new Point(evt.geometry.rings[0][i][0], evt.geometry.rings[0][i][1], new esri.SpatialReference({ "wkid": 102100, "latestWkid": 3857 }));
                    var geometry2 = new Point(evt.geometry.rings[0][i + 1][0], evt.geometry.rings[0][i + 1][1], new esri.SpatialReference({ "wkid": 102100, "latestWkid": 3857 }));







                    // var theLayer = new GraphicsLayer();





                    var pnt = polyline.getExtent().getCenter();
                    var txtSym = new TextSymbol((geometryEngine.geodesicLength(polyline, 'feet')).toFixed(1) + "ft");
                    var font = new Font();
                    font.setStyle(Font.STYLE_OBLIQUE);
                    font.setWeight(Font.WEIGHT_BOLD);
                    font.setSize(16);
                    txtSym.setOffset(0, 10);
                    txtSym.setHorizontalAlignment("justify");
                    txtSym.setColor(new Color([255, 0, 0, 1]));
                    txtSym.setFont(font);

                    var lblGra = new Graphic(pnt, txtSym);

                    // theLayer.add(lblGra);



                    // map.addLayer(theLayer);

                    map.graphics.add(lblGra);




                }


            }

            // var theLayer1 = new GraphicsLayer();

            var pnt = evt.geometry.getExtent().getCenter();
            var txtSym = new TextSymbol((geometryEngine.geodesicArea(evt.geometry, 'square-feet')).toFixed(1) + "Sq Feet");
            var font = new Font();
            font.setStyle(Font.STYLE_OBLIQUE);
            font.setWeight(Font.WEIGHT_BOLD);
            font.setSize(16);
            txtSym.setOffset(0, 10);
            txtSym.setHorizontalAlignment("justify");
            txtSym.setColor(new Color([255, 0, 0, 1]));
            txtSym.setFont(font);

            var lblGra = new Graphic(pnt, txtSym);
            map.graphics.add(lblGra);

            // theLayer1.add(lblGra);



            // map.addLayer(theLayer1);





        } else {

        }




    })



    var Parcels = new FeatureLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/0", {
        minScale: 18055.954822,
        title: "Parcels",
        visible: true
    });

    var ParcelLabels = new FeatureLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/ParcelLabels2019/MapServer/0", {
        title: "Parcel Labels",
        visible: false
    });

    var Streets = new FeatureLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Roads/MapServer/0", {
        title: "Street Names",
        minScale: 9027.977411

    });

    var Streams = new ArcGISDynamicMapServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Hydrology/MapServer", {
        id: "Streams",
        visible: false
    });

    var Contours = new FeatureLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Contour1ft/MapServer/0", {
        title: "Contours 1ft",
        visible: false
    });

    var line = new SimpleLineSymbol();
    line.setColor(new Color([255, 27, 27, 1]));
    var rend = new SimpleRenderer(line);
    Contours.setRenderer(rend);

    var Floodplain = new ArcGISDynamicMapServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Flood_Zones/MapServer", {
        id: "FEMA Flood Maps",
        visible: false
    });

    var Boundary = new FeatureLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/ShelbyCounty/MapServer/0", {
        title: "County Boundary",
        visible: true
    });

    var closures = new FeatureLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Foreclosures/MapServer/0", {
        title: "ForeClosures",
        visible: false
    });

    var sales = new FeatureLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/QualifiedSales/MapServer/0", {
        title: "Qualified Sales",
        visible: false
    });


    var tiled1 = new ArcGISTiledMapServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho1938/ImageServer", {
        id: "1938 Imagery",
        visible: false
    });

    var tiled2 = new ArcGISTiledMapServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho1949/ImageServer", {
        id: "1949 Imagery",
        visible: false
    });
    var tiled3 = new ArcGISTiledMapServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho1962/ImageServer", {
        id: "1962 Imagery",
        visible: false
    });
    var tiled4 = new ArcGISTiledMapServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho1971/ImageServer", {
        id: "1971 Imagery",
        visible: false
    });
    var tiled5 = new ArcGISTiledMapServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho1981/ImageServer", {
        id: "1981 Imagery",
        visible: false
    });
    var tiled6 = new ArcGISImageServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho1990/ImageServer", {
        title: "1990 Imagery",
        visible: false
    });
    var tiled7 = new ArcGISImageServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho2008/ImageServer", {
        title: "2008 Imagery",
        visible: false
    });
    var tiled8 = new ArcGISImageServiceLayer("https://gis.shelbycountytn.gov/public/rest/services/Imagery/Ortho2010/ImageServer", {
        title: "2010 Imagery",
        visible: false
    });
    var tiled9 = new ArcGISImageServiceLayer("https://gis.shelbycountytn.gov/public/rest/services/Imagery/Ortho2012/ImageServer", {
        title: "2012 Imagery",
        visible: false
    });
    var tiled10 = new ArcGISImageServiceLayer("https://gis.shelbycountytn.gov/public/rest/services/Imagery/Ortho2013/ImageServer", {
        title: "2013 Imagery",
        visible: false
    });
    var tiled11 = new ArcGISTiledMapServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho2015/ImageServer", {
        id: "2015 Imagery",
        visible: false
    });
    var tiled12 = new ArcGISImageServiceLayer("https://gis.shelbycountytn.gov/arcgis/rest/services/Imagery/Ortho2017/ImageServer", {
        title: "2017 Imagery",
        visible: false
    });





    var statesLabel = new TextSymbol();
    statesLabel.font.setSize("10pt");
    statesLabel.font.setFamily("arial");
    statesLabel.setHaloColor(new Color([255, 255, 255, 1]));
    statesLabel.setHaloSize(1);

    var json = {
        "labelExpressionInfo": { "value": "{Contour}" }
    };

    var labelClass = new LabelClass(json);
    labelClass.symbol = statesLabel; // symbol also can be set in LabelClass' json
    labelClass.labelPlacement = "center-along";
    Contours.setLabelingInfo([labelClass]);

    map.addLayers([tiled12, tiled11, tiled10, tiled9, tiled8, tiled7, tiled6, tiled5, tiled4, tiled3, tiled2, tiled1, Boundary, Streets, Streams, Floodplain, Contours, closures, sales, ParcelLabels, Parcels]);



    function initSelectionToolbar(evtObj) {
        selectionToolbar = new Draw(evtObj.map);
        selectionToolbar.on("draw-end", areaZoomer);


        // var myWidget = new LayerList({
        //     map: map,
        //     layers: arcgisUtils.getLayerList(map)
        // }, "layerlist");


        // myWidget.startup();




        var myWidget = new LayerList({
            map: map,
            layers: [{},
                {
                    layer: Boundary,
                    title: "County Boundary"
                }, {
                    layer: Streets,
                    title: "Street Names"
                }, {
                    layer: Streams,
                    id: "Streams",
                    subLayers: true
                }, {
                    layer: Floodplain,
                    id: "FEMA Flood Maps",
                    subLayers: true
                }, {
                    layer: Contours,
                    title: "Contours 1ft"
                }, {
                    layer: closures,
                    title: "ForeClosures"
                }, {
                    layer: sales,
                    title: "Qualified Sales"
                }, {
                    layer: Parcels,
                    title: "Parcels"

                },
                {
                    layer: ParcelLabels,
                    title: "Parcel Labels"

                }
            ],
            showLegend: true,
        }, "layerlist");







        myWidget.startup();



        myWidget.on('load', function() {
            expandLayerList();
        });






        var myWidget1 = new LayerList({
            map: map,
            layers: [{},
                {
                    layer: tiled12,
                    title: "2017 Aerial"
                },
                {
                    layer: tiled11,
                    id: "2015 Aerial"
                }, {
                    layer: tiled10,
                    title: "2013 Aerial"
                }, {
                    layer: tiled9,
                    title: "2012 Aerial"
                }, {
                    layer: tiled8,
                    title: "2010 Aerial"
                }, {
                    layer: tiled7,
                    title: "2008 Aerial"
                }, {
                    layer: tiled6,
                    title: "1990 Aerial"
                }, {
                    layer: tiled5,
                    id: "1981 Aerial"
                }, {
                    layer: tiled4,
                    id: "1971 Aerial"
                }, {
                    layer: tiled3,
                    id: "1962 Aerial"
                }, {
                    layer: tiled2,
                    id: "1949 Aerial"
                }, {
                    layer: tiled1,
                    id: "1938 Aerial"
                }
            ],
            showLegend: true,
        }, "layerlist1");


        myWidget1.startup();


    }



    function expandLayerList() {

        document.querySelectorAll('.esriLayer').forEach(function(node, index) {
            if (node.classList.contains('esriHasSubList')) {
                node.classList.add("esriListExpand")

            }
        });

    }





    document.getElementById('zoomIn').addEventListener('click', function() {
        type = "in";
        activateTool("rectangle");

        // map._extentUtil({ numLevels: 1 });


    }, false);

    document.getElementById('zoomOut').addEventListener('click', function() {
        type = "out";
        activateTool("rectangle");
        // map._extentUtil({ numLevels: -1 });
    }, false);

    document.getElementById('fullscreen').addEventListener('click', function() {
        map.centerAndZoom([-89.8253, 35.2269], 11);
    }, false);

    document.getElementById('clearGraphics').addEventListener('click', function() {
        map.graphics.clear();
    }, false);

    document.getElementById('print').addEventListener('click', function() {

        if (singleParcel) {
            $("#layerlist_checkbox_0").click();
            $(document).ready(function() {

                document.getElementById('loadingGIF').src = "./images/loader.gif";
                $("#loading").modal("show");
            });

            printTaskSetup("register", "PDF", singleParcel);

        } else {
            Swal.fire({
                title: 'select parcel',
                animation: false,
                customClass: {
                    popup: 'animated tada'
                }
            });
        }

    }, false);

    function breakLines(printValue) {
        var middle = 28;
        if (printValue != null && printValue.length > middle) {
            var before = printValue.lastIndexOf(' ', middle);
            var after = printValue.indexOf(' ', middle + 1);
            if (middle - before < after - middle) {
                middle = before;
            } else {
                middle = after;
            }
            if (middle == -1) {
                return printValue.substr(middle + 1);
            } else {
                return printValue.substr(0, middle) + '\n' + breakLines(printValue.substr(middle + 1));
            }
        }
        return printValue;
    }


    function printTaskSetup(layout, format, feature) {

        var template = new esri.tasks.PrintTemplate();
        template.format = format;
        template.layout = layout;
        template.layoutOptions = {
            "scalebarUnit": "Feet",
            "copyrightText": "",
            "showAttribution": false,
            "customTextElements": [{
                    "owner1": decodeHtml(breakLines((document.getElementById('OwnName').innerHTML)))
                },
                { "parcel_add": (document.getElementById('Property').innerHTML) },
                { "parcel ": (document.getElementById('Parcel').innerHTML) },
                { "app": (document.getElementById('Appraisal').innerHTML) },
                { "tax": (document.getElementById('District').innerHTML) },
                { "year": (document.getElementById('Year').innerHTML) },
                { "lot": (document.getElementById('Lot').innerHTML) },
                { "sub": decodeHtml(breakLines(document.getElementById('Subdivision').innerHTML)) },
                { "plat": (document.getElementById('BKPG1').innerHTML) },
                { "dim": (document.getElementById('Dimensions').innerHTML) },
                { "acre": (document.getElementById('Acres').innerHTML) },
                { "own_add": feature.attributes.ADDR1 + feature.attributes.ADDR2 },
                { "own_city": feature.attributes.ADDR3 },
                { "own_zip": feature.attributes.ZIP1 + "-" + feature.attributes.ZIP2 }
            ]

        };
        template.preserveScale = false;
        var params = new esri.tasks.PrintParameters();
        params.map = map;
        params.template = template;

        params.map._layers.layer0.minScale = 0;
        params.map._layers.layer0.maxScale = 0
        params.map._layers.layer6.minScale = 0;
        params.map._layers.layer6.maxScale = 0
        printTask = new esri.tasks.PrintTask("https://gis.shelbycountytn.gov/arcgis/rest/services/Geoprocessing/RegisterPrint/GPServer/Export%20Web%20Map");
        printTask.execute(params, printResult);

    }

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    function printResult(result) {
        $("#layerlist_checkbox_0").click();
        $(document).ready(function() {
            document.getElementById('loadingGIF').src = "";
            $("#loading").modal("hide");
        });

        window.open(result.url, "_blank")

    }





    myParcel = getURLParameter('parcelid');
    if (myParcel != null) {
        myParcel = myParcel.replace(/\s+/g, "");
        myParcel = myParcel.replace(/(['"])/g, "");
        queryTask15 = new esri.tasks.QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/0");
        query15 = new esri.tasks.Query();
        query15.returnGeometry = true;
        query15.outFields = ["*"];
        query15.where = "PAID =  \'" + myParcel + "\' OR TPARCEL = \'" + myParcel + "\'";
        query15.outSpatialReference = { wkid: 102100, latestWkid: 3857 };
        queryTask15.execute(query15);

        queryTask15.on("complete", function(parcelResults) {
            if (parcelResults.featureSet.features.length <= 0) {
                $(document).ready(function() {
                    document.getElementById('loadingGIF').src = "";
                    $("#loading").modal("hide");

                });

                Swal.fire({
                    title: 'No Parcel found',
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    }
                });

            } else if (parcelResults.featureSet.features.length > 1) {
                showParceltable(parcelResults);
            } else {
                showParcel(parcelResults);
            }

        });





        $(document).ready(function() {

            document.getElementById('loadingGIF').src = "./images/loader.gif";
            $("#loading").modal("show");
        });


    }

    myOwner = getURLParameter('owner');
    if (myOwner != null) {
        myOwner = myOwner.replace(/(['"])/g, "");
        queryTask15 = new esri.tasks.QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/0");
        query15 = new esri.tasks.Query();
        query15.returnGeometry = true;
        query15.outFields = ["*"];
        query15.where = "OWN1 like  \'%" + myOwner + "\%' ";
        query15.outSpatialReference = { wkid: 102100, latestWkid: 3857 };
        query15.orderByFields = ["ADDR1 DESC"];
        queryTask15.execute(query15);
        queryTask15.on("complete", function(parcelResults) {
            if (parcelResults.featureSet.features.length <= 0) {
                $(document).ready(function() {
                    document.getElementById('loadingGIF').src = "";
                    $("#loading").modal("hide");
                });

                Swal.fire({
                    title: 'No Parcel found',
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    }
                });

            } else if (parcelResults.featureSet.features.length > 1) {
                showtable(parcelResults);
            } else {
                showParcel(parcelResults);
            }

        });

        $(document).ready(function() {
            document.getElementById('loadingGIF').src = "./images/loader.gif";
            $("#loading").modal("show");
        });

    }

    myAddress = getURLParameter('address');
    if (myAddress != null) {
        myAddress = myAddress.replace(/(['"])/g, "");
        queryTask15 = new esri.tasks.QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/0");
        query15 = new esri.tasks.Query();
        query15.returnGeometry = true;
        query15.outFields = ["*"];
        query15.where = "ADDR1_1 like  \'%" + myAddress + "\%' ";
        query15.outSpatialReference = { wkid: 102100, latestWkid: 3857 };
        query15.orderByFields = ["ADDR1_1 DESC"];
        queryTask15.execute(query15);
        queryTask15.on("complete", function(parcelResults) {
            if (parcelResults.featureSet.features.length <= 0) {
                $(document).ready(function() {
                    document.getElementById('loadingGIF').src = "";
                    $("#loading").modal("hide");
                });

                Swal.fire({
                    title: 'No Parcel found',
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    }
                });

            } else if (parcelResults.featureSet.features.length > 1) {
                showtable(parcelResults);
            } else {
                showParcel(parcelResults);
            }

        });

        $(document).ready(function() {
            document.getElementById('loadingGIF').src = "./images/loader.gif";
            $("#loading").modal("show");
        });

    }
    queryTask = new esri.tasks.QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/0");
    query = new esri.tasks.Query();
    query.returnGeometry = true;
    query.outFields = ["*"];


    map.on('click', function(evt) {

        if (!($(".esriButtonChecked").length)) {
            query.geometry = evt.mapPoint;
            query.spatialRelationship = Query.SPATIAL_REL_WITHIN;
            queryTask.execute(query);

            queryTask.on("complete", function(parcelResults) {
                if (parcelResults.featureSet.features.length <= 0) {
                    $(document).ready(function() {
                        document.getElementById('loadingGIF').src = "";

                        $("#loading").modal("hide");
                    });

                    Swal.fire({
                        title: 'No Parcel found',
                        animation: false,
                        customClass: {
                            popup: 'animated tada'
                        }
                    });

                } else if (parcelResults.featureSet.features.length > 1) {
                    showtable(parcelResults);
                } else {
                    showParcel(parcelResults);
                }

            });



            $(document).ready(function() {
                document.getElementById('loadingGIF').src = "./images/loader.gif";
                $("#loading").modal("show");
            });

        }


    });





    changeSomething = function(clicked_id) {
        var queryTask13 = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/0");
        var query13 = new Query();
        query13.returnGeometry = true;
        query13.outFields = ["*"];
        query13.where = "OBJECTID = " + clicked_id + "";
        query13.outSpatialReference = { wkid: 102100, latestWkid: 3857 };
        query13.orderByFields = ["ADDR1 DESC"];
        queryTask13.execute(query13);

        queryTask13.on("complete", function(parcelResults) {
            if (parcelResults.featureSet.features.length <= 0) {
                $(document).ready(function() {
                    document.getElementById('loadingGIF').src = "";
                    $("#loading").modal("hide");
                });

                Swal.fire({
                    title: 'No Parcel found',
                    animation: false,
                    customClass: {
                        popup: 'animated tada'
                    }
                });

            } else if (parcelResults.featureSet.features.length > 1) {
                showtable(parcelResults);
            } else {
                showParcel(parcelResults);
            }

        });



        $(document).ready(function() {
            document.getElementById('loadingGIF').src = "./images/loader.gif";
            $("#loading").modal("show");
        });
    }

    function showParceltable(featureSet) {

        if ($("#MultipleTable").length) {
            $("#multipleMembers").remove();
        }



        var div = document.createElement("div");
        div.setAttribute('id', 'multipleMembers')
        var heading = document.createElement("h3")
        heading.innerHTML = "Multiple Parcels Found Please Select Your Parcel";
        heading.style.color = "red";
        div.appendChild(heading);
        document.getElementById('extraMembers').appendChild(div);
        var table = document.createElement("table");
        table.setAttribute("class", "table table-hover");
        table.setAttribute("id", "MultipleTable");
        div.appendChild(table);
        var thead = document.createElement("thead");
        var thr = document.createElement("tr");
        var thd = document.createElement("td");
        var thd1 = document.createElement("td");
        thr.appendChild(thd);
        thr.appendChild(thd1);
        thead.appendChild(thr);
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.setAttribute("id", "selectRow");
        table.appendChild(tbody);
        featureSet.featureSet.features.forEach(function(result) {
            var tr = document.createElement("tr");
            var td = document.createElement("td");
            var link = document.createElement("a");
            link.setAttribute("onclick", "changeSomething(\'" + result.attributes.OBJECTID + "\');");
            link.setAttribute("class", "ownerhighlight");
            td.appendChild(link);
            var td1 = document.createElement("td");
            link.innerHTML = result.attributes.PARCELID;
            td1.innerHTML = result.attributes.OWN1 + result.attributes.OWN2;
            tr.appendChild(td);
            tr.appendChild(td1);
            tbody.appendChild(tr);
        });

        $(document).ready(function() {
            $('#MultipleTable').DataTable();
            document.getElementById('loadingGIF').src = "";
            $("#loading").modal("hide");
        });

    }





    function showtable(featureSet) {

        if ($("#MultipleTable").length) {
            $("#multipleMembers").remove();
        }



        var div = document.createElement("div");
        div.setAttribute('id', 'multipleMembers')
        var heading = document.createElement("h3")
        heading.innerHTML = "Multiple Parcels Found Please Select Your Parcel";
        heading.style.color = "red";
        div.appendChild(heading);
        document.getElementById('extraMembers').appendChild(div);
        var table = document.createElement("table");
        table.setAttribute("class", "table table-hover");
        table.setAttribute("id", "MultipleTable");
        div.appendChild(table);
        var thead = document.createElement("thead");
        var thr = document.createElement("tr");
        var thd = document.createElement("td");
        var thd1 = document.createElement("td");
        thr.appendChild(thd);
        thr.appendChild(thd1);
        thead.appendChild(thr);
        table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.setAttribute("id", "selectRow");
        table.appendChild(tbody);
        featureSet.featureSet.features.forEach(function(result) {
            var tr = document.createElement("tr");
            var td = document.createElement("td");
            var link = document.createElement("a");
            link.setAttribute("onclick", "changeSomething(\'" + result.attributes.OBJECTID + "\');");
            link.setAttribute("class", "ownerhighlight");
            td.appendChild(link);
            var td1 = document.createElement("td");
            link.innerHTML = result.attributes.OWN1;
            td1.innerHTML = result.attributes.ADDR1_1;
            tr.appendChild(td);
            tr.appendChild(td1);
            tbody.appendChild(tr);
        });

        $(document).ready(function() {
            $('#MultipleTable').DataTable();
            document.getElementById('loadingGIF').src = "";
            $("#loading").modal("hide");
        });

    }

    function showParcel(featureSet) {

        map.graphics.clear();
        var line = new SimpleLineSymbol();
        line.setWidth(3);
        line.setColor(new Color([0, 92, 230, 1]));
        var fill = new SimpleFillSymbol();
        fill.setColor(new Color([0, 92, 230, 0]));
        fill.setOutline(line);
        var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NONE, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));

        map.setExtent((featureSet.featureSet.features[0].geometry.getExtent().expand(1)), true);
        var graphic = new Graphic(featureSet.featureSet.features[0].geometry, fill);
        map.graphics.add(graphic);

        details.length = 0;
        singleParcel = featureSet.featureSet.features[0]
        ParcelID = featureSet.featureSet.features[0].attributes.PARCELID;
        document.getElementById("OwnName").innerHTML = featureSet.featureSet.features[0].attributes.OWN1 + " " + featureSet.featureSet.features[0].attributes.OWN2;
        document.getElementById("add1").innerHTML = featureSet.featureSet.features[0].attributes.ADRNO + " " + featureSet.featureSet.features[0].attributes.ADRSTR + " " + featureSet.featureSet.features[0].attributes.ADRSUF + " " + featureSet.featureSet.features[0].attributes.ADRDIR;
        document.getElementById("add2").innerHTML = featureSet.featureSet.features[0].attributes.ADDR3;
        document.getElementById("add3").innerHTML = featureSet.featureSet.features[0].attributes.ZIP1;

        document.getElementById("Property").innerHTML = featureSet.featureSet.features[0].attributes.ADDR1_1 + ", " + (featureSet.featureSet.features[0].attributes.CITY_1).toUpperCase(); + " " + featureSet.featureSet.features[0].attributes.ZIP1_1;


        document.getElementById("Parcel").innerHTML = featureSet.featureSet.features[0].attributes.PARCELID;
        document.getElementById("Longitude").innerHTML = featureSet.featureSet.features[0].attributes.LONG;
        document.getElementById("Latitude").innerHTML = featureSet.featureSet.features[0].attributes.LAT;

        document.getElementById("GoogleViewInfo").href = "https://www.google.com/maps/@" + featureSet.featureSet.features[0].attributes.LAT + "," + featureSet.featureSet.features[0].attributes.LONG + ",630a,35y,39.17t/data=!3m1!1e3";
        document.getElementById("taxMap").innerHTML = '';
        var aTag1 = "";
        aTag1 = document.createElement('a');
        aTag1.setAttribute('href', "http://register.shelby.tn.us/taximg.php?imgtype=pdf&map=" + featureSet.featureSet.features[0].attributes.MAP);
        aTag1.setAttribute('target', "_blank");
        aTag1.innerHTML = featureSet.featureSet.features[0].attributes.MAP;

        document.getElementById("taxMap").appendChild(aTag1);
        // document.getElementById("Use").innerHTML = featureSet.features[0].attributes.LUC;


        var queryTaskLUC = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/9");
        var queryLUC = new Query();
        queryLUC.returnGeometry = false;
        queryLUC.outFields = ["*"];
        queryLUC.where = "TBLE = 'ASMT' AND FLD = 'LUC' AND VAL= 0" + featureSet.featureSet.features[0].attributes.LUC;
        queryTaskLUC.execute(queryLUC);
        queryTaskLUC.on("complete", function(evtLUC) {
            document.getElementById("Use").innerHTML = (evtLUC.featureSet.features[0].attributes.MSG);

        });




        if (featureSet.featureSet.features[0].attributes.CITY == "M") {
            document.getElementById("District").innerHTML = "MILLINGTON";
        } else
        if (featureSet.featureSet.features[0].attributes.CITY == "L") {
            document.getElementById("District").innerHTML = "LAKELAND";
        } else if (featureSet.featureSet.features[0].attributes.CITY == "G") {
            document.getElementById("District").innerHTML = "GERMANTOWN";
        } else if (featureSet.featureSet.features[0].attributes.CITY == "D") {
            document.getElementById("District").innerHTML = "DISTRICT 1";
        } else if (featureSet.featureSet.features[0].attributes.CITY == "C") {
            document.getElementById("District").innerHTML = "COLLIERVILLE";
        } else if (featureSet.featureSet.features[0].attributes.CITY == "B") {
            document.getElementById("District").innerHTML = "BARTLETT";
        } else if (featureSet.featureSet.features[0].attributes.CITY == "0") {
            document.getElementById("District").innerHTML = "MEMPHIS";
        } else {
            document.getElementById("District").innerHTML = "";
        }


        var queryTask5 = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/1");
        var query5 = new Query();
        query5.returnGeometry = false;
        query5.outFields = ["*"];
        query5.where = "PARID =  \'" + featureSet.featureSet.features[0].attributes.PARCELID + "\' ";
        queryTask5.execute(query5);
        queryTask5.on("complete", function(evt5) {
            document.getElementById("Appraisal").innerHTML = "$" + (evt5.featureSet.features[0].attributes.RTOTAPR).toLocaleString();

        });


        var queryTask3 = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/2");
        var query3 = new Query();
        query3.returnGeometry = true;
        query3.outFields = ["*"];
        query3.where = "PARID =  \'" + featureSet.featureSet.features[0].attributes.PARCELID + "\' ";
        queryTask3.execute(query3);

        queryTask3.on("complete", function(evt2) {
            if (evt2.featureSet.features.length >= 1) {
                document.getElementById("Year").innerHTML = evt2.featureSet.features[0].attributes.YRBLT;
            }

        });



        var queryTask2 = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/5");
        var query2 = new Query();
        query2.returnGeometry = true;
        query2.outFields = ["*"];
        query2.where = "PARID =  \'" + featureSet.featureSet.features[0].attributes.PARCELID + "\' ";
        queryTask2.execute(query2);

        queryTask2.on("complete", function(evt1) {
            document.getElementById("Acres").innerHTML = evt1.featureSet.features[0].attributes.ACRES;
            document.getElementById("Dimensions").innerHTML = evt1.featureSet.features[0].attributes.LOTDIM;
            document.getElementById("Subdivision").innerHTML = evt1.featureSet.features[0].attributes.SUBDIV;
            document.getElementById("Lot").innerHTML = evt1.featureSet.features[0].attributes.SUBLOT;


            if (evt1.featureSet.features[0].attributes.RTS != null) {
                var parts = evt1.featureSet.features[0].attributes.RTS.split('-', 2);
                var book = parts[0];
                var page = parts[1];
                document.getElementById("BKPG1").innerHTML = evt1.featureSet.features[0].attributes.RTS;
                // document.getElementById("BKPG").href = "https://register.shelby.tn.us/pdetail.php?rts=" + evt1.featureSet.features[0].attributes.RTS;
                document.getElementById("BKPG").href = "https://register.shelby.tn.us/search/?book=" + book + "&page=" + page;
            } else {
                document.getElementById("BKPG1").innerHTML = "UNKNOWN";
                document.getElementById("BKPG").href = "https://register.shelby.tn.us/Inst_Type.php"
            }


        });



        var queryTask1 = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/7");
        var query1 = new Query();
        query1.returnGeometry = true;
        query1.outFields = ["*"];
        query1.where = "PARID =  \'" + featureSet.featureSet.features[0].attributes.PARCELID + "\' ";
        queryTask1.execute(query1);

        queryTask1.on("complete", function(evt1) {
            document.getElementById("Zoning").innerHTML = evt1.featureSet.features[0].attributes.ZONING;
            // document.getElementById("Property").innerHTML = evt1.featureSet.features[0].attributes.ADRNO +evt1.featureSet.features[0].attributes.ADRDIR  + ADRSTR + ;


            var queryTaskclass = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/9");
            var queryclass = new Query();
            queryclass.outFields = ["*"];
            queryclass.where = "TBLE = 'PARDAT' AND FLD = 'CLASS' AND VAL= \'" + evt1.featureSet.features[0].attributes.CLASS + "\' ";
            queryTaskclass.execute(queryclass);
            queryTaskclass.on("complete", function(evtclass) {
                document.getElementById("Class").innerHTML = evtclass.featureSet.features[0].attributes.MSG;

            });

        });


        document.getElementById("CountyTaxInfo").href = "https://apps.shelbycountytrustee.com/TaxQuery/Inquiry.aspx?ParcelID=" + featureSet.featureSet.features[0].attributes.TPARCEL;
        document.getElementById("AppraisalInfo").href = "https://www.assessor.shelby.tn.us/PropertySearchDetail2017.aspx?id=" + featureSet.featureSet.features[0].attributes.PARCELID;
        switch (featureSet.featureSet.features[0].attributes.CITY_1) {
            case "Arlington":
                document.getElementById("CityTaxInfo").style.display = "none";
                break;
            case "Bartlett":
                document.getElementById("CityTaxInfo").innerHTML = "City (Bartlett) Tax Info";
                document.getElementById("CityTaxInfo").href = "https://cityofbartlett.munisselfservice.com/citizens/RealEstate/default.aspx";
                break;
            case "Collierville":
                document.getElementById("CityTaxInfo").innerHTML = "City (Collierville) Tax Info";
                document.getElementById("CityTaxInfo").href = "https://collierville-tn.mygovonline.com/mod.php?mod=propertytax&mode=public_lookup";
                break;
            case "Germantown":
                document.getElementById("CityTaxInfo").innerHTML = "City (Germantown) Tax Info";
                document.getElementById("CityTaxInfo").href = "https://germ-egov.aspgov.com/Click2GovTX/index.html";
                break;
            case "Lakeland":
                document.getElementById("CityTaxInfo").innerHTML = "City (Lakeland) Tax Info";
                document.getElementById("CityTaxInfo").href = "http://www.lakelandtn.gov/index.aspx?NID=198";
                break;
            case "Memphis":
                document.getElementById("CityTaxInfo").innerHTML = "City (Memphis) Tax Info";
                document.getElementById("CityTaxInfo").href = "https://epayments.memphistn.gov/Property/Detail.aspx?ParcelNo=" + featureSet.featureSet.features[0].attributes.PARCELID;
                break;
            case "Millington":
                document.getElementById("CityTaxInfo").style.display = "none";
                break;
            default:
                document.getElementById("CityTaxInfo").style.display = "none";
        }


        var queryTask6 = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/10");
        var query6 = new Query();
        query6.returnGeometry = false;
        query6.outFields = ["*"];
        query6.where = "PARID =  \'" + featureSet.featureSet.features[0].attributes.PARCELID + "\' ";
        query6.orderByFields = ["SALEDT DESC"];
        queryTask6.execute(query6);


        queryTask6.on("complete", function(evt5) {
            const parent = document.getElementById("salesInformation");
            document.getElementById("DetailsPane").click();
            document.getElementById("DetailsWidget").style.display = "block"

            document.getElementById("infoWidget").style.display = "none"
            while (parent.firstChild) {
                //parent.firstChild.remove();
                parent.removeChild(parent.firstChild);
            }
            arrayUtils.forEach(evt5.featureSet.features, function(entry, i) {

                var tbdy = document.createElement('tbody');
                var tr = document.createElement('tr');
                var td = document.createElement('td');
                var td1 = document.createElement('td');

                var aTag = document.createElement('a');
                aTag.setAttribute('href', entry.attributes.Link);
                aTag.setAttribute('target', "_blank");
                aTag.innerHTML = entry.attributes.TRANSNO;

                var span = document.createElement('span');
                span.innerHTML = " ";

                td1.style.textAlign = "right";
                td.appendChild(document.createTextNode('Inst# / Type'));
                td1.appendChild(aTag);
                td1.appendChild(span);
                td1.appendChild(document.createTextNode(entry.attributes.INSTRTYP));
                tr.appendChild(td);
                tr.appendChild(td1);
                tbdy.appendChild(tr);
                var tr1 = document.createElement('tr');
                var td2 = document.createElement('td');
                var td3 = document.createElement('td');
                td3.style.textAlign = "right";
                var price;
                if (entry.attributes.PRICE != null) {
                    price = "$" + (entry.attributes.PRICE).toLocaleString();
                } else {
                    price = "UNAVAILABLE";
                }
                td2.appendChild(document.createTextNode('Sales Date/Price'));
                td3.appendChild(document.createTextNode((new Date(entry.attributes.SALEDT)).toLocaleDateString() + " " + price));
                tr1.appendChild(td2);
                tr1.appendChild(td3);
                tbdy.appendChild(tr1);
                document.getElementById("salesInformation").appendChild(tbdy);
            });
            $(document).ready(function() {
                document.getElementById('loadingGIF').src = "";
                $("#loading").modal("hide");
            });

        });




    }

    map.on("mouse-move", showCoordinates);
    map.on("mouse-drag", showCoordinates);

    function showCoordinates(evt) {

        var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
        document.getElementById("info").innerHTML = mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
    }




    parcelNumberSubmit = function() {

        var parcelNumber = document.querySelector("#parceldetails [name='parcelNumber']");

        if (parcelNumber.value == "") {

            Swal.fire({
                title: 'Enter Parcel ID',
                animation: false,
                customClass: {
                    popup: 'animated tada'
                }
            });
        } else {
            var parcel_id = parcelNumber.value;
            parcel_id = parcel_id.replace(/\s+/g, "");


            // 

            var queryTask10 = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/0");
            var query10 = new Query();
            query10.returnGeometry = true;
            query10.outFields = ["*"];
            query10.where = "PAID like  \'" + parcel_id + "\%' OR TPARCEL like \'" + parcel_id + "\%'";
            query10.outSpatialReference = { wkid: 102100, latestWkid: 3857 };
            queryTask10.execute(query10);
            queryTask10.on("complete", function(parcelResults) {
                if (parcelResults.featureSet.features.length <= 0) {
                    $(document).ready(function() {
                        document.getElementById('loadingGIF').src = "";
                        $("#loading").modal("hide");
                    });

                    Swal.fire({
                        title: 'No Parcel found',
                        animation: false,
                        customClass: {
                            popup: 'animated tada'
                        }
                    });

                } else if (parcelResults.featureSet.features.length > 1) {
                    showParceltable(parcelResults);
                } else {
                    showParcel(parcelResults);
                }

            });

            $(document).ready(function() {
                document.getElementById('loadingGIF').src = "./images/loader.gif";
                $("#loading").modal("show");
            });
        }

    }


    ownerNameSubmit = function() {
        var ownerName = document.querySelector("#ownerdetails [name='OwnerName']");
        if (ownerName.value == "") {

            Swal.fire({
                title: 'Enter ownerName',
                animation: false,
                customClass: {
                    popup: 'animated tada'
                }
            });
        } else {
            var queryTask11 = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/0");
            var query11 = new Query();
            query11.returnGeometry = true;
            query11.outFields = ["*"];
            query11.where = "OWN1 like  \'%" + ownerName.value + "\%' ";
            query11.outSpatialReference = { wkid: 102100, latestWkid: 3857 };
            query11.orderByFields = ["ADDR1 DESC"];
            queryTask11.execute(query11);
            queryTask11.on("complete", function(ownerResults) {
                if (ownerResults.featureSet.features.length <= 0) {
                    $(document).ready(function() {
                        document.getElementById('loadingGIF').src = "";
                        $("#loading").modal("hide");
                    });

                    Swal.fire({
                        title: 'No Parcel found',
                        animation: false,
                        customClass: {
                            popup: 'animated tada'
                        }
                    });

                } else if (ownerResults.featureSet.features.length > 1) {
                    showtable(ownerResults);
                } else {
                    showParcel(ownerResults);
                }

            });

            $(document).ready(function() {
                document.getElementById('loadingGIF').src = "./images/loader.gif";
                $("#loading").modal("show");
            });

        }
    }


    addressSubmit = function() {
        var address = document.querySelector("#addressdetails [name='searchAddress']");

        if (address.value == "") {

            Swal.fire({
                title: 'Enter Street Number',
                animation: false,
                customClass: {
                    popup: 'animated tada'
                }
            });
        } else {


            axios.get('https://gis.shelbycountytn.gov/arcgis/rest/services/Geoprocessing/SC_Locator/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&Single+Line+Input=' + address.value + '&category=&outFields=*&maxLocations=&outSR=&searchExtent=&location=&distance=&magicKey=&f=pjson')
                .then(function(response) {
                    console.log(response);
                    if (response.data.candidates.length == 1) {

                        if (response.data.candidates[0].score >= 85) {

                            var id = response.data.candidates[0].attributes.User_fld;
                            id = id.replace(/\s+/g, "");
                            var queryTask12 = new QueryTask("https://gis.shelbycountytn.gov/arcgis/rest/services/BaseMap/Assessor_Parcel/MapServer/0");
                            var query12 = new Query();
                            query12.returnGeometry = true;
                            query12.outFields = ["*"];
                            query12.where = "PAID like  \'" + id + "\%'";
                            query12.outSpatialReference = { wkid: 102100, latestWkid: 3857 };
                            queryTask12.execute(query12);
                            queryTask12.on("complete", function(addressResults) {
                                if (addressResults.featureSet.features.length <= 0) {
                                    $(document).ready(function() {
                                        document.getElementById('loadingGIF').src = "";
                                        $("#loading").modal("hide");
                                    });

                                    Swal.fire({
                                        title: 'No Parcel found',
                                        animation: false,
                                        customClass: {
                                            popup: 'animated tada'
                                        }
                                    });

                                } else if (addressResults.featureSet.features.length > 1) {
                                    $(document).ready(function() {
                                        document.getElementById('loadingGIF').src = "./images/loader.gif";
                                        $("#loading").modal("show");
                                    });
                                    showtable(addressResults);
                                } else {
                                    $(document).ready(function() {
                                        document.getElementById('loadingGIF').src = "./images/loader.gif";
                                        $("#loading").modal("show");
                                    });
                                    showParcel(addressResults);
                                }

                            });


                        } else {
                            Swal.fire({
                                title: 'No Address found',
                                animation: false,
                                customClass: {
                                    popup: 'animated tada'
                                }
                            });
                        }

                    } else {
                        Swal.fire({
                            title: 'No Address found',
                            animation: false,
                            customClass: {
                                popup: 'animated tada'
                            }
                        });
                    }
                })
                .catch(function(error) {
                    console.log(error);
                })









        }
    }






    window.addEventListener('keydown', function(e) {
        if (e.keyIdentifier == 'U+000A' || e.keyIdentifier == 'Enter' || e.keyCode == 13) {
            if (e.target.nodeName == 'INPUT' && e.target.type == 'text') {

                switch (e.target.id) {
                    case 'searchAddress':
                        addressSubmit();
                        break;
                    case 'OwnerName':
                        ownerNameSubmit();
                        break;
                    case 'parcelNumber':
                        parcelNumberSubmit();
                        break;
                    case 'taxMapNumber':
                        taxMapSubmit();
                        break;
                }
            }
        }
    }, true);


    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }

    go();
    window.addEventListener('resize', go);

    function go() {


        if (!singleParcel) {
            if ((document.documentElement.clientWidth > 1100) && (document.documentElement.clientWidth <= 1500)) {
                map.centerAndZoom([-90.000, 35.181], 11)
            } else if ((document.documentElement.clientWidth > 800) && (document.documentElement.clientWidth <= 1100)) {
                map.centerAndZoom([-90.000, 35.181], 9)
            } else if ((document.documentElement.clientWidth > 550) && (document.documentElement.clientWidth <= 800)) {
                map.centerAndZoom([-90.000, 35.181], 9)
            } else if (document.documentElement.clientWidth <= 550) {
                map.centerAndZoom([-90.000, 35.181], 10)
            } else {
                map.centerAndZoom([-90.000, 35.181], 11)
            }
        } else {
            map.setExtent((singleParcel.geometry.getExtent().expand(2)), true);

        }

    }




});