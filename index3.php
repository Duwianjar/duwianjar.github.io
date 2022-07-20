<html>

<head>
    <title>Responsi Kelas A - 2100018014</title>
    <!-- CSS  -->
    <link rel="stylesheet" href="style3.css">
</head>

<body>
    <div class="container">
        <h1>Responsi Kelas A - 2100018014</h1>
    </div>
    <!-- Java Script untuk kalkulator -->
    <p>
        <script language="JavaScript" src="script3.js">
        </script>
    </p>
    <div class="container">
        <h2 align="center">
            <marquee width="50%"><br>Selamat Datang...</marquee>
        </h2>
        <?php
	//buka file counter mode baca
	$filecounter="counter.txt";
	$fl=fopen($filecounter,"r+");

	//ambil nilai hit dan simpan dalam variabel $hit
	$hit=fread($fl,filesize($filecounter));

	//tampilkan
	echo("<table width=300 align=center border=1 cellspacing=0 cellpadding=0 bordercolor=#E9967A><tr>");
	echo("<td width=250 valign=middle align=center>");
	echo("<font face=verdana size=2 color=#000000><b>");
	echo("Anda pegunjung yang ke:");
	echo($hit);
	echo ("<br><br></font>");
    echo ("</td>");
    echo ("</tr></table>");

    date_default_timezone_set('Asia/Jakarta');
    $date=new DateTime('now');
    echo ("<p align=center>");
    echo $date->format('d-m-Y | H:i:s');
    echo ("</p>");

	//tutup file counter.txt
	fclose($fl);

	//buka file counter.txt mode tulis  
	$fl=fopen($filecounter,"w+");

	//tambahkan nilai hit dengan 1
	$hit=$hit+1;

	//simpan
	fwrite($fl,$hit,strlen($hit));

	//tutup
	fclose($fl);
	?>
    </div>
    <div id="content">
        <div id="main-content">
            <div id="news">
                <form name="fform">
                    <h1 style="background-color: green " id="hijau"><br />Kalkulator Sederhana</h1>
                    <pre>
                Bilangan Pertama :
                <input type="text" size="11"name="bilangan1"> 
                Bilangan Kedua :
                <input type="text" size="11"name="bilangan2">
                </PRE>
                    <p>
                        <input type="button" value="Jumlahkan" onclick="jumlah()" />
                        <input type="button" value="Kurangkan" onclick="kurang()" />

                        <input type="button" value="kalikan" onclick="kali()" />
                        <input type="button" value="Bagikan" onclick="bagi()" />

                        <input type="reset" value="Ulang" />
                    </p>
                </form>
            </div>
        </div>
        <div id="main-content2">
            <div id="news">
                <h1 style="background-color: green " id="hijau"><br />Kalender Sederhana</h1>
                <?php 	
    $hari = date("d");
    $bulan = date("m");
    $tahun = date("Y");
    $jumlahhari = date("t",mktime(0,0,0,$bulan,$hari,$tahun));
   ?>
                <br /><br>
                <?php
   switch ($bulan) {
    case 1 : $nmbulan = "Jan"; break;
    case 2 : $nmbulan = "Feb"; break;
    case 3 : $nmbulan = "Mar"; break;
    case 4 : $nmbulan = "Apr"; break;
    case 5 : $nmbulan = "Mei"; break;
    case 6 : $nmbulan = "Jun"; break;
    case 7 : $nmbulan = "Jul"; break;
    case 8 : $nmbulan = "Agu"; break;
    case 9 : $nmbulan = "Sep"; break;
    case 10 : $nmbulan = "Okt"; break;
    case 11 : $nmbulan = "Nop"; break;
    case 12 : $nmbulan = "Des"; break;
   }
   echo "<center><h1>$hari $nmbulan $tahun</h1></center>";?>
                <br>
                <table style="border:2px solid #1e90ff" align="center" cellpadding="10">
                    <tr bgcolor="#add8e6">
                        <td align="center">
                            <font color="#ff0000">Min</font>
                        </td>
                        <td align="center">Sen</td>
                        <td align="center">Sel</td>
                        <td align="center">Rab</td>
                        <td align="center">Kam</td>
                        <td align="center">Jum</td>
                        <td align="center">Sab</td>
                    </tr>
                    <?php
    $s=date ("w" , mktime(0,0,0,$bulan,1,$tahun));
    for ($ds=1;$ds<=$s;$ds++){
        echo "<td></td>";
    }
    for ($d=1;$d<=$jumlahhari;$d++) {
        if (date("w",mktime(0,0,0,$bulan,$d,$tahun))==0) {
            echo "<tr>";
        }

        $warna="#000000";

        if (date("l",mktime (0,0,0,$bulan,$d,$tahun)) == "Sunday") {
            $warna="ff0000";
        }

        echo "<td align=center valign=middle><span style=\"color:$warna\">$d</span></td>";

        if (date("w",mktime (0,0,0,$bulan,$d,$tahun)) ==6) {
            echo "</tr>";
        }
    }
    echo '</table>';
    ?>
                </table>
            </div>
        </div>
        <div id="main-content2">
            <div id="isibuku">
                <div id="news">

                    <h1 style="background-color: green " id="hijau"><br />Buku Tamu</h1>
                    <form name="form1" method="post" action="proses.php">
                        <table width="58%" border="0" align="center">
                            <br>
                            <tr>
                                <td>Nama Lengkap</td>
                                <td><input name="nama" type="text" id="nama"></td>
                            </tr>

                            <tr>
                                <td>Alamat</td>
                                <td><input name="alamat" type="text" id="alamat"></td>
                            </tr>

                            <tr>
                                <td>E-Mail</td>
                                <td><input name="email" type="text" id="email"></td>
                            </tr>
                            </tr>

                            <tr>
                                <td>Status</td>
                                <td>
                                    <select name="status" id="status">
                                        <option>Menikah</option>
                                        <option>Single</option>
                                    </select>
                                </td>
                            </tr>

                            <tr>
                                <td>Komentar</td>
                                <td><textarea name="komentar" id="komentar"></textarea></td> </textarea>
                            </tr>
                            <tr>
                                <td><input type="hidden" name="tanggal" id="tanggal"
                                        value="<?php echo date("d-m-Y"); ?>">
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>
                                    <input type="submit" name="Submit" value="Kirim">
                                    <input type="reset" name="Submit2" value="Batal">
                                </td>
                            </tr>
                        </table>
                    </form>

                    <h2>
                        <center><a href="#lihat">::Lihat komentar::</a></center>
                    </h2>
                </div>
            </div>
        </div>
    </div>
    <div id="setelah-proses">
        <h2>Setelah anda mengisi buku tamu di atas nantinya akan tampil di bawah</h2>
    </div>

    <div id="lihat">
        <?php 
echo "<head><title>My Guest Book</title></head>";
$fp = fopen("guestbook.txt", "r");
echo("<table width=300 align=center border=1
 cellspacing=4 cellpadding=2 bordercolor=#00000><tr>");
echo "<tr><td><center>Tanggal</center> 
</td><td><center>Nama</center></td><td> <center>Alamat</center> </td><td> <center>Email</center> </td><td> <center>Status</center> </td><td> <center>Komentar</center> </td></tr>";
while ($isi = fgets($fp)) {
    $pisah = explode('|', $isi);
    echo "<tr><td>$pisah[0] </td><td>$pisah[1] </td><td>$pisah[2] </td><td>$pisah[3] </td><td>$pisah[4] </td><td>$pisah[5] </td></tr><br>";
}
echo "</table><br>";
echo "<center><a href='#isibuku'> Isi buku tamu lagi</a><?center>";?>
    </div>

</body>

</html>