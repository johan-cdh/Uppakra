<?php
header('Content-Type: application/json; charset=utf-8');
header('access-control-allow-origin: *'); 
// http://localhost/uppakrax/json.php
// ob_start('ob_gzhandler');  
/*
function is_valid_callback($subject)
{
  $identifier_syntax
    = '/^[$_\p{L}][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}]*+$/u';

  $reserved_words = array('break', 'do', 'instanceof', 'typeof', 'case',
    'else', 'new', 'var', 'catch', 'finally', 'return', 'void', 'continue',
    'for', 'switch', 'while', 'debugger', 'function', 'this', 'with',
    'default', 'if', 'throw', 'delete', 'in', 'try', 'class', 'enum',
    'extends', 'super', 'const', 'export', 'import', 'implements', 'let',
    'private', 'public', 'yield', 'interface', 'package', 'protected',
    'static', 'null', 'true', 'false');

  return preg_match($identifier_syntax, $subject)
    && ! in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words);
}
*/


$baseurl=($_SERVER['SERVER_NAME']=="localhost") ? "http://localhost/finds/jpg/": "https://uppakra.dh.gu.se/finds/jpg/";  
$link = mysqli_connect("127.0.0.1", "guest", "mx{4uGjX", "uppakra");  

// Parameters
$page=!empty($_GET['page']) ? $_GET['page'] : 0;
$search = !empty($_GET['search']) ? $_GET['search'] : NULL;
$id=!empty($_GET['id']) ? (int) $_GET['id'] : 0;
$period = !empty($_GET['period']) ? $_GET['period'] : false;
$offset=$page*10;
// A seed for the random ordering. Should be unique to the frontend page load, so that it's consistent
// when inifite-scrolling but different when refreshing the page.
$seed = !empty($_GET['seed']) ? $_GET['seed'] : 0;

if ($id==0) {
  $select = "SELECT fyndnr, prio, foto, sakord, typ, material, period FROM finds";
  $conditions = [];
  if ($search) {
    // Concat all text fields, with space before and between, and then match against word starts.
    $search = mysqli_real_escape_string($link, str_replace('*', '%', $search));
    $conditions[] = "REPLACE(CONCAT_WS(' ', '', sakord, typ, material, del, fragmentering, period, dekor, form, kategori, intrasis), '\n', ' ') LIKE '% $search%'";
  }
  elseif ($period) {
    // '-' means filter by empty period
    $conditions[] = $period == '-' ? "period = ''" : "period = '$period'";
  }
  else {
    $conditions[] = "foto = 1 AND prio > 0";
  }

  if ($conditions) {
    $select .= " WHERE " . implode(" AND ", $conditions);
  }
  $select .= $period ? " ORDER BY fyndnr" : " ORDER BY prio > 0 DESC, rand($seed + id)";
  $select .= " LIMIT 10 OFFSET $offset";
}
else {
  // Get record by id
  $select = "SELECT * FROM finds WHERE fyndnr=$id";
}

$geojson = array();
$result=mysqli_query($link,$select);

while($row = mysqli_fetch_assoc($result)) { 
  $prio=$row['prio'];
  // $width$row[2];
  // $height=$row[3]
  $id=$row['fyndnr'];
  $description=$row['sakord'];
  if ($row['period'])
    $description.=", ".$row['period'];
  
  $filename = ($row['foto'] && $row['prio']) ? "31000_{$id}__{$prio}.jpg" : "missing.jpg";
  $url = "{$baseurl}{$filename}";
  $thumb = "{$baseurl}thumbs/{$filename}";

  $feature = $row + array(
    'type' => 'jpg',
    'id' => $id,
    'description' => $description,
    'url' => $url,
    'thumb' => $thumb,
  );
  array_push($geojson, $feature);
} // end while  
  
mysqli_free_result($result);
mysqli_close($link);
$json=json_encode($geojson);
// cf. http://www.geekality.net/2010/06/27/php-how-to-easily-provide-json-and-jsonp/
if( ! isset($_GET['callback']))
  exit($json);
// is_valid_callback does not work
// if(is_valid_callback($_GET['callback']))
else
  exit("{$_GET['callback']}($json)");
  # Otherwise, bad request
  // header('status: 400 Bad Request', true, 400);
  // echo isset($_GET['callback']) ? "{$_GET['callback']}($json)" : $json;   
?>
