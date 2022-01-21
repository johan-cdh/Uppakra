<?php
// http://localhost/uppakra1/ol-parsel/dist/getdata.php?tb=fynd&id=757
// 

$link = mysqli_connect("127.0.0.1", "guest", "mx{4uGjX", "uppakra");  

$tb= ($_GET['tb']) ?  $_GET['tb'] : "fynd";
$id= ($_GET['id']) ?  (int) $_GET['id'] : (int)0;
$fid= ($_GET['fid']) ?  (int) $_GET['fid'] : (int)0;
 
// check if $tb and $id) 
// Returns: json
    $geojson = array(
    "type"      => "FeatureCollection",
    "layer"      => "$tb",
    "features"  => array()
    ); 
// if ($tb and ($id=0 or $fid=0))     
    $fields=mysqli_query($link,"SHOW COLUMNS FROM $tb");
    if (!$fields)
        return(false);
    
    if ($id >0) {
        $query="SELECT * FROM $tb WHERE OGR_FID=$id ";
    }
    else if ($fid > 0) {
        $query="SELECT * FROM $tb WHERE fyndnummer=$fid ";
    }
    if ($values = mysqli_query($link, $query)) {
        $value = mysqli_fetch_row($values);
        $i=0;
        $feature = array(
            "type" => "Feature",
        );
        while($row1 = mysqli_fetch_row($fields)) {  
            $field=$row1[0];
            $temp=$row1[1];
            $pos1 = strpos($temp, "(");
            $pos2 = strpos($temp, ")");
            $type= ($pos1 === false) ? $temp : substr($temp, 0, $pos1);
            $length= ($pos1 === false) ? "" : substr($temp,$pos1+1,$pos2-$pos1-1);
            
            if ($type=="enum")
                $length=str_replace( "'", "", $length);
            // Get Label
            /*
            $row2=mysqli_fetch_row($labels);
            if ($lang=="en")
                $label=$row2[3];
            else
                $label=$row2[4];
            $ftab=$row2[5];
            $fcol=$row2[6];
            */
            else if ($type=="geometry") {
                // Läs in geometry igen som geojson (inte så elegant)!
                $query2="SELECT ST_GeometryType(SHAPE), 
                    CASE ST_GeometryType(SHAPE) 
                    WHEN 'POINT' THEN ST_AsGeoJSON(SHAPE,4) 
                    WHEN 'LINESTRING' THEN ST_AsGeoJSON(ST_StartPoint(SHAPE),4) 
                    ELSE ST_AsGeoJSON(ST_Centroid(SHAPE),4) 
                    END
                    FROM $tb ";
                if ($fid > 0) 
                    $query2.=" WHERE fyndnummer=$fid";
                else 
                    $query2.=" WHERE OGR_FID=$id";    
                $res=mysqli_query($link,$query2);
                
                $row = mysqli_fetch_row($res);
                $geomtype= $row[0];
                $geom=json_decode($row[1],true);    
                $geomstr=$geom['coordinates'][0]." ".$geom['coordinates'][1];
                $feature["SHAPE"] = array("SHAPE",$type,$geomtype,$geomstr);
            }
            else {   
                $val=($value[$i]==null) ? "" : ($value[$i]);
                $feature[$field] = array($field,$type,$length,$val);
            }            
            $i++;
        }
        array_push($geojson['features'], $feature);  
        mysqli_free_result($values);
        mysqli_free_result($fields);     
    }
 

/* close connection */
mysqli_close($link);
$json=json_encode($geojson);
header('Content-Type: application/json; charset=utf-8');
echo $json;
?>