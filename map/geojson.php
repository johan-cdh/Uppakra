<?php
$link = mysqli_connect("127.0.0.1", "guest", "mx{4uGjX", "uppakra");  

$layer= ($_GET['layer']) ?  $_GET['layer'] : "fynd";
    // urn:ogc:def:crs:OGC:1.3:CRS84
    // bounding box is in EPSG:4326
    // Returns geojson
    // http://localhost/uppakra1/ol-parcel/geojson.php?layer=fynd&bbox=5.881203927734365,55.094651151792874,22.140969552734365,61.734593917334195
    $bbox=($_GET['bbox']) ? $_GET['bbox']:""; //Default=entire realm -1200000, 4700000, 2600000, 8500000
    if ($bbox) {
        list($west, $south, $east, $north) = explode(",", $bbox); // west, south, east, north
        $res=mysqli_query($link,"SET @g = GeomFromText('LineString($west $south,$east $north)')");
    }
    // urn:ogc:def:crs:OGC:1.3:CRS84
    $geojson = array(
    "type"      => "FeatureCollection",
    "layer"      => "$layer",
    "crs" => array(
      "type" => "name",
      "properties" => array(
        "name" => "EPSG:4326"
      )
    ),
    "features"  => array()
    ); 
    // Map Layers
    if ($layer=="fynd") {
        $query="SELECT OGR_FID,sakord,ST_AsGeoJSON(SHAPE,8)
        FROM $layer";
    }
    else if ($layer=="elevation2m") {
        $query="SELECT OGR_FID,'',ST_AsGeoJSON(SHAPE) 
        FROM $layer";
    }
    else if ($layer=="fmis_point" || $layer=="fmis_line" || $layer=="fmis_area") {
        $query="SELECT OGR_FID,CONCAT(raa_nummer,': ', lamningtyp),ST_AsGeoJSON(SHAPE) 
        FROM $layer";
    }
    else {
        $query="SELECT OGR_FID,subclass,ST_AsGeoJSON(SHAPE) 
        FROM $layer";
    }
    if ($bbox) 
        $query.=" WHERE MBRWithin(SHAPE,@g)";
    $result = mysqli_query($link,$query);	
    if (!$result)  {
        mysqli_close($link);
        return(false);
    }
    while ($row = mysqli_fetch_row($result)) {
        $feature = array(
            "type" => "Feature", 
            "geometry" => json_decode($row[2],true),
            "properties" => array(
                "id" => $row[0],
                "name" => ($row[1]==null) ? "" : $row[1],
                )
            );
        array_push($geojson['features'], $feature);    
    }   // end while
    mysqli_free_result($result); 

/* close connection */
mysqli_close($link);
$json=json_encode($geojson);
header('Content-Type: application/json; charset=utf-8');
echo $json;
?>