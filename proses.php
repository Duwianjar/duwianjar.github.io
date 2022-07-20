<?php 

$tanggal = $_POST['tanggal'];
$nama = $_POST['nama'];
$email = $_POST['email'];
$alamat = $_POST['alamat'];
$status = $_POST['status'];
$komentar = $_POST['komentar'];


echo "<head><title>My Guest Book</title></head>";
$fp = fopen("guestbook.txt", "a+");
fputs($fp, "$tanggal|$nama|$alamat|$email|$status|$komentar\n");
fclose($fp);

header("Location:index3.php?#lihat")
?>