<?php
$link = mysqli_connect("127.0.0.1", "guest", "mx{4uGjX", "uppakra");

$default_fields = ['sakord', 'typ', 'material', 'del', 'period', 'form', 'kategori'];
$fields = !empty($_GET['fields']) ? explode(',', $_GET['fields']) : $default_fields;

$counts = [];

foreach ($fields as $field) {
  $query = "SELECT `$field`, COUNT(`$field`) FROM finds GROUP BY `$field`";
  $result = mysqli_query($link, $query);
  while ($row = mysqli_fetch_row($result)) {
    $counts[] = [
      'field' => $field,
      'value' => $row[0],
      'count' => $row[1],
    ];
  }
}

header('Content-Type: application/json; charset=utf-8');
header('access-control-allow-origin: *');
exit(json_encode($counts));
