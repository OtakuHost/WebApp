<?php
	header("Cache-Control: no-cache, must-revalidate"); //HTTP 1.1
	header("Pragma: no-cache"); //HTTP 1.0
	header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
	header('Access-Control-Allow-Origin: *');
	header('Content-Type:application/json');



    require("../bd/PHPMailer-6.1.1/src/PHPMailer.php");
    require("../bd/PHPMailer-6.1.1/src/SMTP.php");
    require("../bd/PHPMailer-6.1.1/src/Exception.php");
    //Create a new PHPMailer instance
    $mail = new PHPMailer\PHPMailer\PHPMailer();

    $banco = "brasil-senpai";	// Banco de Dados
    $endereco = "mysql669.umbler.com";	// Host
    $usuario = "brasilsenpai";	 // Usu??rio
    $senha = "CPDNEJOHO";	 // Senha         // Senha
    $errocon = "Configura?¡ì??o de Banco de Dados Errada!";
    $errodb = "Banco de Dados Inexistente!";
    $con =  mysqli_connect($endereco, $usuario, $senha, $banco);
    $con->set_charset("utf8");
	$OPC=$_GET["call"];
	$OPC();
	$GLOBALS['Cont']=0;
	$GLOBALS['ContAtual']=21;

function temporada(){
    $Animes = array();
    $sql = $GLOBALS["con"]->query("SELECT CodAniMan, Nome, Estado FROM animes_mangas WHERE Estado!='' AND Estado!='Completo' ORDER BY Estado");
    while($r = mysqli_fetch_array($sql)) {
        $Temp['CodAniMan'] = ($r['CodAniMan']);
        $Temp['Nome'] = ($r['Nome']);
        $Temp['Estado'] = ($r['Estado']);
        array_push($Animes,$Temp);
    }
    echo json_encode($Animes);
}

function config(){
    $Arquivos = array();
    $dir    = './';
    $dir = scandir($dir);
    foreach(array_slice($dir,2)  as $file){
        $Temp['Nome'] = $file;
        $Temp['Versao'] =  date ("ymdHi", filemtime($file));
        $Temp['Link'] = "http://brasilsenpai.net/web/".$file;
        array_push($Arquivos,$Temp); 
    }
    return ($Arquivos);
}

function usnome(){
    $_GET["Nome"] = str_replace("UPDATE", "", $_GET["Nome"]);
    $_GET["Nome"] = str_replace("DELET", "", $_GET["Nome"]);
    $_GET["Nome"] = str_replace("INSERT", "", $_GET["Nome"]);
    $sql = $GLOBALS["con"]->query("SELECT CodUsuario FROM usuarios WHERE Nome='".$_GET["Nome"]."'");
    if($r = mysqli_fetch_array($sql)) {
        echo 1;
    }else{
        $sql = $GLOBALS["con"]->query("UPDATE usuarios SET Nome='".$_GET["Nome"]."' WHERE CodUsuario=".$_GET["CodUsuario"]);
        echo 0;
    }
}

function inicial(){
    $Dados['config'] = config();
    $Dados['Mural'] = "";
    $Dados['Anime'] = $GLOBALS["con"]->query("SELECT episodios.*, animes_mangas.Nome FROM episodios, animes_mangas WHERE animes_mangas.CodAniMan=episodios.CodAniMan ORDER BY episodios.Data DESC LIMIT 60 ");
    $Dados['Anime'] = convert_query_to_json($Dados['Anime']);
    $Dados['Manga'] = $GLOBALS["con"]->query("SELECT capitulos.*, animes_mangas.Nome FROM capitulos, animes_mangas WHERE animes_mangas.CodAniMan=capitulos.CodAniMan ORDER BY capitulos.Data DESC LIMIT 60 ");
    $Dados['Manga'] = convert_query_to_json($Dados['Manga']);
    if(isset($_GET["CodUsuario"])){
        $lixo = $GLOBALS["con"]->query("UPDATE usuarios SET ContLogs=ContLogs+1, Ultimo_login=CURRENT_DATE WHERE CodUsuario=".$_GET["CodUsuario"]." && Ultimo_login<CURRENT_DATE ");
        $Dados['Usuario']['Dados'] = $GLOBALS["con"]->query("SELECT * FROM usuarios WHERE CodUsuario=".$_GET["CodUsuario"]);
        $Dados['Usuario']['Favoritos'] = $GLOBALS["con"]->query("SELECT animes_mangas.Nome,animes_mangas.CodAniMan, animes_mangas.Tipo FROM animes_mangas,usuarios_favoritos WHERE usuarios_favoritos.CodUsuario=".$_GET["CodUsuario"]." AND animes_mangas.CodAniMan=usuarios_favoritos.CodAniMan");
        $Dados['Usuario']['Dados'] = convert_query_to_json($Dados['Usuario']['Dados'])[0];
        $Dados['Usuario']['Favoritos'] = convert_query_to_json($Dados['Usuario']['Favoritos']);
    }
    echo json_encode($Dados);
}

function sinopse(){
    $Dados['Sinopse'] = $GLOBALS["con"]->query("SELECT * FROM animes_mangas WHERE CodAniMan=".$_GET["CodAniMan"]);
    $Dados['Sinopse'] = convert_query_to_json($Dados['Sinopse'])[0];
    
    $Dados['Episodios'] = $GLOBALS["con"]->query("SELECT * FROM episodios WHERE CodAniMan=".$_GET["CodAniMan"]." ORDER BY Episodio+0 ASC");
    $Dados['Episodios'] = convert_query_to_json($Dados['Episodios']);
    if(false && $Dados['Sinopse']['Tipo']=="Manga"){
        $Capitulos = manga_cap_ManHost($Dados['Sinopse']['Nome'],$Dados['Sinopse']['CodAniMan'],1);
        if(count($Capitulos)==0){
            $Capitulos = $GLOBALS["con"]->query("SELECT Episodio FROM capitulos WHERE CodAniMan=".$Dados['Sinopse']['CodAniMan']." LIMIT 1");
            $Capitulos = convert_query_to_json($Capitulos)[0];
            $Capitulos = manga_cap_ManHost($Dados['Sinopse']['Nome'],$Dados['Sinopse']['CodAniMan'],$Capitulos['Episodio']);
        }
    }
    
    $Dados['Capitulos'] = $GLOBALS["con"]->query("SELECT * FROM capitulos WHERE CodAniMan=".$_GET["CodAniMan"]." ORDER BY Episodio+0 ASC");
    $Dados['Capitulos'] = convert_query_to_json($Dados['Capitulos']);
    
    $Dados['Comentarios'] = $GLOBALS["con"]->query("SELECT comentarios.Comentario,comentarios.Data,usuarios.Nome,usuarios.Email, (usuarios.Vip >= CURRENT_TIMESTAMP) as VIP FROM comentarios,usuarios WHERE CodAniMan=".$Dados['Sinopse']['CodAniMan']." AND usuarios.CodUsuario=comentarios.CodUsuario ORDER BY comentarios.Data DESC");
    $Dados['Comentarios'] = convert_query_to_json($Dados['Comentarios']);
    
    $Dados['Sinopse']['Descricao'] = str_replace('"',"'",$Dados['Sinopse']['Descricao']);
    $Dados = str_replace('\r','<br>',json_encode($Dados));
    $Dados = str_replace('\n','<br>',$Dados);
    $Dados = str_replace('\"',"'",$Dados);
    echo $Dados;
}

function email_config(){
    $GLOBALS["mail"]->IsSMTP(); 
    $GLOBALS["mail"]->SMTPDebug = 0; 
    $GLOBALS["mail"]->SMTPAuth = true; 
    $GLOBALS["mail"]->SMTPSecure = 'tls'; 
    $GLOBALS["mail"]->Host = "smtp.umbler.com";
        
    $GLOBALS["mail"]->Port = 587; 
    $GLOBALS["mail"]->IsHTML(true);
    //Username to use for SMTP authentication
    $GLOBALS["mail"]->Username = "contato@brasilsenpai.net";
    $GLOBALS["mail"]->Password = "cpdnejoho";
    //Set who the message is to be sent from
    $GLOBALS["mail"]->setFrom('contato@brasilsenpai.net', 'Brasil Senpai');
}

function reportar_src(){
    $result['Error'] = false;
    $qr = "select CodSrc, CodUsuario FROM report_src WHERE Codusuario='".$_GET["CodUsuario"]."' AND CodSrc='".$_GET["CodSrc"]."'";
	$sql = $GLOBALS["con"]->query($qr);
	if(mysqli_num_rows($sql)>0){
	    $result['Error'] = true;
	}else{
	    $qr = "INSERT INTO report_src(CodSrc, CodUsuario,Tipo) VALUES (".$_GET["CodSrc"].",".$_GET["CodUsuario"].",".$_GET["Tipo"].")";
	    $sql = $GLOBALS["con"]->query($qr);
	    $qr = "UPDATE episodios_src SET Strick=Strick+1 WHERE CodSrc=".$_GET["CodSrc"];
	    $sql = $GLOBALS["con"]->query($qr);
	}
	echo json_encode($result);
}


function fav_up(){
	$sql = $GLOBALS["con"]->query("UPDATE animes_mangas SET NFavorito=NFavorito+1 WHERE CodAniMan=".$_GET["CodAniMan"]);
	$nice['Nice']=true;
}

// -------- Update Nota
function nota(){
	$CodAnime=$_GET["CodAniMan"];
	$Nota=$_GET["Nota"];
	$Cons= "UPDATE animes_mangas SET Nota$Nota=Nota$Nota+1 WHERE CodAniMan='$CodAnime'";
	$sql = $GLOBALS["con"]->query($Cons);
	$Cons= "SELECT * from animes_mangas WHERE CodAniMan='$CodAnime'";
	$sql = $GLOBALS["con"]->query($Cons);
	while($r = mysqli_fetch_array($sql)) {
		$NNotas=($r['Nota1'])+($r['Nota2'])+($r['Nota3'])+($r['Nota4'])+($r['Nota5']);
		$Nota1=($r['Nota1']);
		$Nota2=($r['Nota2'])*2;
		$Nota3=($r['Nota3'])*3;
		$Nota4=($r['Nota4'])*4;
		$Nota5=($r['Nota5'])*5;
		$NotaFinal=$Nota1+$Nota2+$Nota3+$Nota4+$Nota5;
		if($NotaFinal!=0){
			$NotaFinal=($NotaFinal/$NNotas);
		}else{
			$NotaFinal=0;
		}			
		$Nota=number_format($NotaFinal, 2, '.', '');
		$Cons= "UPDATE animes_mangas SET NotaF=$NotaFinal WHERE CodAniMan='$CodAnime'";
		$sql = $GLOBALS["con"]->query($Cons);
	}
	$nice['Nice']=true;
	echo json_encode($nice);
}

function favorito(){
    if($_GET['Type']==0){
        $sql = $GLOBALS["con"]->query("DELETE FROM usuarios_favoritos WHERE CodUsuario='".$_GET['CodUsuario']."' AND CodAniMan='".$_GET["CodAniMan"]."'");
        $nice['Nice']=false;
    		        
    }else{
        $sql = $GLOBALS["con"]->query("UPDATE animes_mangas SET NFavorito=NFavorito+1 WHERE CodAniMan=".$_GET["CodAniMan"]);
        $sql = $GLOBALS["con"]->query("INSERT INTO usuarios_favoritos (CodUsuario, CodAniMan) VALUES ('".$_GET['CodUsuario']."','".$_GET["CodAniMan"]."')");
        $nice['Nice']=true;
    }
    echo json_encode($nice);
}

function comentar(){
    $_GET["Comentario"] = utf8_decode($_GET["Comentario"]);
    $_GET["Comentario"] = str_replace("INSERT ", "", $_GET["Comentario"]);
    $_GET["Comentario"] = str_replace("DROP ", "", $_GET["Comentario"]);
    $_GET["Comentario"] = str_replace("UPDATE ", "", $_GET["Comentario"]);
    $_GET["Comentario"] = str_replace("SELECT ", "", $_GET["Comentario"]);
    $lixo = $GLOBALS["con"]->query("INSERT INTO comentarios (CodAniMan, CodUsuario, Comentario, Data) VALUES (".$_GET["CodAniMan"].",".$_GET["CodUsuario"].",'".$_GET["Comentario"]."',CURRENT_TIMESTAMP)");
    $nice['Nice']=true;
    echo json_encode($nice);
}


//Pesquisa de anime pela area de "Pesquisa"
function pesquisa(){
    $_GET["Nome"] = str_replace("INSERT", "", $_GET["Nome"]);
    $_GET["Nome"] = str_replace("DROP", "", $_GET["Nome"]);
    $_GET["Nome"] = str_replace("UPDATE", "", $_GET["Nome"]);
    $_GET["Categoria"] = str_replace("INSERT", "", $_GET["Categoria"]);
    $_GET["Categoria"] = str_replace("DROP", "", $_GET["Categoria"]);
    $_GET["Categoria"] = str_replace("UPDATE", "", $_GET["Categoria"]);
    if($_GET["Pagina"]==1){
         $sql = $GLOBALS["con"]->query("SELECT CodAniMan, Nome FROM animes_mangas WHERE Nome LIKE '%".$_GET["Nome"]."%' AND Tipo='".$_GET["Categoria"]."' ORDER BY Nome ASC LIMIT 63");
    }else{
        $_GET["Pagina"] = $_GET["Pagina"]-1;
        $sql = $GLOBALS["con"]->query("SELECT CodAniMan, Nome FROM animes_mangas WHERE Nome LIKE '%".$_GET["Nome"]."%' AND Tipo='".$_GET["Categoria"]."' ORDER BY Nome ASC LIMIT ".($_GET["Pagina"]*63).", 63");
    }
    $Cont=0;
    $Num=0;
	$sql = convert_query_to_json($sql);
    echo json_encode($sql);
}

//Busca de animes, usado pela "Pesquisa" e "Categoria"
function genero(){
    $_GET["Genero"] = str_replace("INSERT", "", $_GET["Genero"]);
    $_GET["Genero"] = str_replace("DROP", "", $_GET["Genero"]);
    $_GET["Genero"] = str_replace("UPDATE", "", $_GET["Genero"]);
    $_GET["Genero"] = str_replace("(", "Generos LIKE '%", $_GET["Genero"]);
    $_GET["Genero"] = str_replace(")", "%'", $_GET["Genero"]);
    $_GET["Genero"] = str_replace("%'Generos", "%' AND Generos", $_GET["Genero"]);
    
    $_GET["Categoria"] = str_replace("INSERT", "", $_GET["Categoria"]);
    $_GET["Categoria"] = str_replace("DROP", "", $_GET["Categoria"]);
    $_GET["Categoria"] = str_replace("UPDATE", "", $_GET["Categoria"]);
    
    if($_GET["Pagina"]==1){
         $sql = $GLOBALS["con"]->query("SELECT CodAniMan, Nome FROM animes_mangas WHERE ".$_GET["Genero"]." AND Tipo='".$_GET["Categoria"]."' ORDER BY Nome ASC LIMIT 63");
    }else{
        $_GET["Pagina"] = $_GET["Pagina"]-1;
        $sql = $GLOBALS["con"]->query("SELECT CodAniMan, Nome FROM animes_mangas WHERE ".$_GET["Genero"]." AND Tipo='".$_GET["Categoria"]."' ORDER BY Nome ASC LIMIT ".($_GET["Pagina"]*63).", 63");
    }
    $sql = convert_query_to_json($sql);
    echo json_encode($sql);
}

    function episodio(){
        $Fontes['Fontes']= Array(); 
        $sql = $GLOBALS["con"]->query("SELECT src, CodSrc,Strick FROM episodios_src WHERE CodEpisodio=".$_GET['CodEpisodio']."  ORDER BY Strick ASC, contentId DESC ");
        while($r = mysqli_fetch_array($sql)){
            $Video=null;
            if (strpos(($r['src']), 'video.g?')){
                array_push($Fontes['Fontes'],[($r['src']),true,($r['CodSrc']),($r['Strick'])]);
            }else{
                array_push($Fontes['Fontes'],[($r['src']),false,($r['CodSrc']),($r['Strick'])]);
            }
        }
    echo json_encode($Fontes);
}

//Login sistema.
function login(){
	$Erro=TRUE;
	$Dados['Dados'] = $GLOBALS["con"]->query("SELECT * FROM usuarios WHERE Email='".$_GET['Email']."'");
    if(mysqli_num_rows($Dados['Dados'])>0){
        $Dados['Dados'] = convert_query_to_json($Dados['Dados'])[0];
        $Dados['Favoritos'] = $GLOBALS["con"]->query("SELECT animes_mangas.Nome,animes_mangas.CodAniMan, animes_mangas.Tipo FROM animes_mangas,usuarios_favoritos WHERE usuarios_favoritos.CodUsuario=".$Dados['Dados']['CodUsuario']." AND animes_mangas.CodAniMan=usuarios_favoritos.CodAniMan");
        $Dados['Favoritos'] = convert_query_to_json($Dados['Favoritos']);
        email_config();
        //Set who the message is to be sent to
        $GLOBALS["mail"]->addAddress($_GET['Email']);
        //Set the subject line
        $GLOBALS["mail"]->Subject = 'Codigo de login';
        //Read an HTML message body from an external file, convert referenced images to embedded,
        //convert HTML into a basic plain-text alternative body
        $GLOBALS["mail"]->Body = 'Seu codigo de login: '.$Dados['Dados']['CodUsuario'];
        //send the message, check for errors
        if (!$GLOBALS["mail"]->send()) {
            //echo "Mailer Error";
        } else {
            //echo "Message sent!";
        }
        
        echo json_encode($Dados);
    }else{
        $qr = "INSERT INTO usuarios (Email, Vip) VALUES ('".$_GET['Email']."',NOW() + INTERVAL 7 DAY)";
        $sql = $GLOBALS["con"]->query($qr);
        login();
    }
}









//Gerar blocos de anuncios nas lista de animes.
function Anuncio($Num){
    
}

//Update user, caso aja alguma mudança forte no sistema.
function UpdateUser(){
    $qr = "SELECT CodUsuario, Vip, Nome, Email, ContLogs, Ajudou FROM usuarios WHERE CodUsuario='".$_COOKIE["CodUsuario"]."'";
    $sql = $GLOBALS["con"]->query($qr);
    if($r = mysqli_fetch_array($sql)){
        $UserNome = ($r['Nome']);
        $UserVIPData = ($r['Vip']);
        $UserFoto = ($r['Foto']);
        $UserEmail = ($r['Email']);
        setcookie("Ajudou", ($r['Ajudou']));
        setcookie("VIPData", ($r['Vip']));
        setcookie("Nome", ($r['Nome']));
        setcookie("Foto", ($r['Foto']));
        setcookie("Email", ($r['Email']));
        setcookie("ContLogs", ($r['ContLogs']));
    }
}

//Controle dos favoritos.
function Func3(){
    if(!isset($_COOKIE["Favoritos"]) ){
        $Favoritos= array();
    }else{
        $Favoritos = explode(",",$_COOKIE["Favoritos"]);
    }
    if(count($Favoritos)==0){
        array_push($Favoritos,$_GET["CodAniMan"]);
        setcookie("Favoritos", implode(",", $Favoritos));
        echo 2;
    }else{
        if(count($Favoritos)>=300){
            //Limite de favoritos atingido.
            echo 3;
        }else{
            //Contem o anime ja nos favoritos.
            if(in_array($_GET["CodAniMan"],$Favoritos)){
                echo 1;
                unset($Favoritos[array_search($_GET["CodAniMan"], $Favoritos)]);
                setcookie("Favoritos", implode(",", $Favoritos));
                if(isset($_COOKIE["CodUsuario"]) && $_COOKIE["CodUsuario"] !== null){
                    $qr = "DELETE FROM usuarios_favoritos WHERE CodUsuario='".$_COOKIE["CodUsuario"]."' AND CodAniMan='".$_GET["CodAniMan"]."'";
    		        $sql = $GLOBALS["con"]->query($qr);
                }
                
            }else{
            //Sistema viu que ainda não foi adiconado aos favoritos.
                echo 2;
                array_push($Favoritos,$_GET["CodAniMan"]);
                setcookie("Favoritos", implode(",", $Favoritos));
                if(isset($_COOKIE["CodUsuario"]) && $_COOKIE["CodUsuario"] !== null){
                    $qr = "INSERT INTO usuarios_favoritos (CodUsuario, CodAniMan) VALUES ('".$_COOKIE["CodUsuario"]."','".$_GET["CodAniMan"]."')";
    		        $sql = $GLOBALS["con"]->query($qr);
                }
            }
        }
    }
}


function Func6(){
    $_GET["Nome"] = str_replace("INSERT ", "", $_GET["Nome"]);
    $_GET["Nome"] = str_replace("DROP ", "", $_GET["Nome"]);
    $_GET["Nome"] = str_replace("UPDATE ", "", $_GET["Nome"]);
	$CodUsuario=$_GET["CodUsuario"];
	$Nome=$_GET["Nome"];
	$Erro=TRUE;
	$qr = "SELECT CodUsuario FROM usuarios WHERE Nome='$Nome'";
	$sql = $GLOBALS["con"]->query($qr);
	while($r = mysqli_fetch_array($sql)){
		$Erro=FALSE;
	}
	if($Erro){
		$qr = "UPDATE usuarios SET Nome='$Nome' WHERE CodUsuario='$CodUsuario'";
		$sql = $GLOBALS["con"]->query($qr);
		echo 0;
		setcookie("Nome", $Nome);
	}else{
		echo 1;
	}
}



function Func8(){
    $qr = "DELETE FROM mensagens WHERE CodUsuario='".$_COOKIE["CodUsuario"]."' AND CodMsg='".$_GET["CodMsg"]."'";
	$sql = $GLOBALS["con"]->query($qr);
	echo 0;
}

function Func9(){
    $qr = "select CodAnime, Episodio, Data FROM episodios order by Data desc limit 135";
	$sql = $GLOBALS["con"]->query($qr);
	while($r = mysqli_fetch_array($sql)){
	    $qr2 = "select Nome from anime where CodAnime='".($r['CodAnime'])."'";
		$sql2 = $GLOBALS["con"]->query($qr2);
		while($r2 = mysqli_fetch_array($sql2)){
			IF (date('Y-m-d 00:00:00')<($r['Data'])){
            	$Data= true;
    		}
    		Else{
    			$Data= false; 
    		}
    		?>
    		    <div onclick="Lanc(<?php echo ($r['CodAnime']);?>,'<?php echo ($r['Episodio']);?>')"class="gallery">
    			    <b class="d1"><?php echo ($r['Episodio']);?></b>
    				    <?php if($Data){ echo '<img class="d2" src="https://4.bp.blogspot.com/-i5BdqBm48rs/WxAUQCusUsI/AAAAAAAAH90/6dHqP9qTie0GU7ZWQH45HDEH4s_2FzpAQCLcBGAs/s1600/clock.png">';}?>
    				    <a target="_blank" class="cover" style="padding:0 0 150.0% 0">
    			        <img class="lazy" src="http://brasilsenpai.net/capas/<?php echo ($r['CodAnime']);?>.jpg" width="250" height="375">
    			        <div class="caption"><?php echo ($r2['Nome']);?></div>
    				    </a>
    			</div>
    		<?php
	    	}
	}
}

function Func11(){
    $qr = "select Nome FROM anime WHERE CodAnime='".$_GET["CodAnime"]."'";
    $sql = $GLOBALS["con"]->query($qr);
    if($r = mysqli_fetch_array($sql)){
    	$Nome = ($r['Nome']);    
    }
    if($_GET["Tipo"]==0){
        if($_GET["Link"]===null){
            $qr = "DELETE FROM episodios WHERE CodAnime='".$_GET["CodAnime"]."' AND Episodio='".$_GET["Episodio"]."'";
	        $sql = $GLOBALS["con"]->query($qr);
        }else{
            if($_GET["CodErro"]!=2){
                $qr = "UPDATE episodios SET Link='".$_GET["Link"]."', Player='' WHERE CodAnime='".$_GET["CodAnime"]."' AND Episodio='".$_GET["Episodio"]."'";
	            $sql = $GLOBALS["con"]->query($qr);
            }
        }
        $qr = "select CodUsuario FROM report WHERE CodAnime='".$_GET["CodAnime"]."' AND Episodio='".$_GET["Episodio"]."' AND CodErro='".$_GET["CodErro"]."'";
    	$sql = $GLOBALS["con"]->query($qr);
    	while($r = mysqli_fetch_array($sql)){
    	    $qr2 = "UPDATE usuarios SET Ajudou=Ajudou+1 WHERE CodUsuario='".($r['CodUsuario'])."'";
	        $sql2 = $GLOBALS["con"]->query($qr2);
	        
	        $qr2 = "select Email FROM usuarios WHERE CodUsuario=".($r['CodUsuario']);
    	    $sql2 = $GLOBALS["con"]->query($qr2);
    	    if($r2 = mysqli_fetch_array($sql)){
    	        if(($r2['notificacao'])=="OneSignal"){
    	            $qr2 = "INSERT INTO mensagens(CodUsuario, De, Titulo, Mensagem, Data) VALUES (".($r['CodUsuario']).",0,'".$Nome." - ".$_GET["Episodio"]."','Episodio foi atualizado com uma nova fonte! <br />Obrigado pelo aviso! <br /><center><b>+1 Colaboração</b></center>Cada ponto de colaboração corresponde a 1 semana de VIP, para fazer a troca entre em contato! Menu>Contatos:EMAIL',CURRENT_TIMESTAMP)";
	                $sql2 = $GLOBALS["con"]->query($qr2);
    	        }else{
    	            $subject = $Nome." - ".$_GET["Episodio"];
                	$message = 'Episodio foi atualizado com uma nova fonte! <br />Obrigado pelo aviso! <br /><center><b>+1 Colaboração</b></center>Cada ponto de colaboração corresponde a 1 semana de VIP, para fazer a troca entre em contato! Menu>Conta:TROCAR VIP';
                	$headers = 'From: admin@brasilsenpai.net' . "\r\n" .
                    'Reply-To: admin@brasilsenpai.net' . "\r\n" .
                    'X-Mailer: PHP/' . phpversion();
                	mail($Email, $subject, $message, $headers);
    	        }
    	    }
    	}
    }else{
        $qr = "select CodUsuario FROM report WHERE CodAnime='".$_GET["CodAnime"]."' AND Episodio='".$_GET["Episodio"]."' AND CodErro='".$_GET["CodErro"]."'";
    	$sql = $GLOBALS["con"]->query($qr);
    	while($r = mysqli_fetch_array($sql)){
    	    $qr2 = "UPDATE usuarios SET Penalidade=Penalidade+1 WHERE CodUsuario='". ($r['CodUsuario'])."'";
	        $sql2 =$GLOBALS["con"]->query($qr2);
	        
	        $qr2 = "select Email FROM usuarios WHERE CodUsuario=".($r['CodUsuario']);
    	    $sql2 = $GLOBALS["con"]->query($qr2);
    	    if($r2 = mysqli_fetch_array($sql)){
    	        if(($r2['notificacao'])=="OneSignal"){
    	            $qr2 = "INSERT INTO mensagens(CodUsuario, De, Titulo, Mensagem, Data) VALUES (".($r['CodUsuario']).",0,'".$Nome." - ".$_GET["Episodio"]."','Episodio foi verificado e se encontra normal!<br /><center><b>+1 Penalidade</b></center>',CURRENT_TIMESTAMP)";
	                $sql2 = $GLOBALS["con"]->query($qr2);
    	        }else{
    	            $subject = $Nome." - ".$_GET["Episodio"];
                	$message = 'Episodio foi verificado e se encontra normal!<br /><center><b>+1 Penalidade</b></center>';
                	$headers = 'From: admin@brasilsenpai.net' . "\r\n" .
                    'Reply-To: admin@brasilsenpai.net' . "\r\n" .
                    'X-Mailer: PHP/' . phpversion();
                	mail($Email, $subject, $message, $headers);
    	        }
    	    }
    	}
    	
    }
    $qr = "DELETE FROM report WHERE CodAnime='".$_GET["CodAnime"]."' AND Episodio='".$_GET["Episodio"]."' AND CodErro='".$_GET["CodErro"]."'";
	$sql = $GLOBALS["con"]->query($qr);
}

function Func12(){
    $DiasVIP=$_COOKIE["Ajudou"]*7;
    $qr = "SELECT VIPData FROM usuarios WHERE CodUsuario='".$_COOKIE["CodUsuario"]."' AND VIPData>CURRENT_TIMESTAMP";
    $sql = $GLOBALS["con"]->query($qr);
    if($r = mysqli_fetch_array($sql)){
        $qr = "UPDATE usuarios SET Ajudou=Ajudou-".$_COOKIE["Ajudou"].", VIPData=adddate(VIPData,+".$DiasVIP.") WHERE CodUsuario='".$_COOKIE["CodUsuario"]."' AND Ajudou>='".$_COOKIE["Ajudou"]."'";
	    $sql = $GLOBALS["con"]->query($qr);
    }else{
        $qr = "UPDATE usuarios SET Ajudou=Ajudou-".$_COOKIE["Ajudou"].", VIPData=adddate(CURRENT_TIMESTAMP,+".$DiasVIP.") WHERE CodUsuario='".$_COOKIE["CodUsuario"]."' AND Ajudou>='".$_COOKIE["Ajudou"]."'";
    	$sql = $GLOBALS["con"]->query($qr);
    }
    UpdateUser();
}

function Func13(){
    $qr = "SELECT CodAnime FROM opening WHERE CodOpening='".$_GET["CodOpening"]."' AND CodAnime='".$_GET["CodAnime"]."'";
    $sql = $GLOBALS["con"]->query($qr);
    if($r = mysqli_fetch_array($sql)){
        $qr = "UPDATE usuarios SET Pontos=Pontos+20, OpeningLVL=OpeningLVL+1 WHERE CodUsuario='".$_COOKIE["CodUsuario"]."'";
    	$sql = $GLOBALS["con"]->query($qr);
    	echo 0;
    }else{
        $qr = "UPDATE usuarios SET Pontos=Pontos-5 WHERE CodUsuario='".$_COOKIE["CodUsuario"]."' AND Pontos>0";
    	$sql = $GLOBALS["con"]->query($qr);
    	echo 1;
    }
}

//Exporta dados do usuario.
function Func14(){
    $temp = "";
    foreach ($_COOKIE as $key=>$val){
        if($key=="Email" || $key=="CodUsuario" || strpos($key, 'Hist') !== false || $key=="Favoritos" || strpos($key,"Not") !== false){
        $temp = $key.'[,]'.$val."[-]".$temp;
        }
    }
    
    echo $temp;
}

//Importa dados do usuario.
function Func15(){
    $temp = explode("[-]", $_GET["Dados"]);
    $Cont = 0;
    while(count($temp)>$Cont){
        $Temp2 = $temp[$Cont];
        $Temp2 = explode("[,]", $Temp2);
        setcookie($Temp2[0],$Temp2[1]);
        $Cont++;
        echo $Temp2[0]."".$Temp2[1]."\n";
    }
}

function Func16(){
    header('Access-Control-Allow-Origin: *');
    $Temp = TratamentoTitulo($_GET["Anime"]);
    $CodAnime = CodAnimeGET(explode ('[,]', $Temp)[0]);
    $Episodio = explode ('[,]', $Temp)[1];
    $Episodio = $Episodio+0;
    if($CodAnime!="false" AND is_numeric($Episodio)){
        if($Episodio<9){
            $Episodio=$Episodio+0;
            $Episodio="0".$Episodio;
        }
        $_GET["CodAnime"] = $CodAnime;
        $_GET["Episodio"] = "EP".$Episodio;
        if($_GET["Link"]!=null){
            Func11();
            echo "Sucesso muleke! Link atualizado.";
        }else{
            $qr = "UPDATE episodios SET HD='".$_GET["HD"]."' WHERE CodAnime='".$_GET["CodAnime"]."' AND Episodio='".$_GET["Episodio"]."'";
            $sql = $GLOBALS["con"]->query($qr);
            echo "Sucesso muleke! HD atualizado.";
        }
    }else{
        echo "Algo deu errado parceiro!";
    }
}

function Func17(){
    header('Access-Control-Allow-Origin: *');
    $qr = "UPDATE episodios SET HD='".$_GET["HD"]."' WHERE CodAnime='".$_GET["CodAnime"]."' AND Episodio='".$_GET["EP"]."'";
    $sql = $GLOBALS["con"]->query($qr);
}

function Func18(){
    header('Access-Control-Allow-Origin: *');
    $sql = $GLOBALS["con"]->query("SELECT CodAnime FROM anime WHERE Nome='".$_GET["Nome"]."' AND Categoria='Manga'");
	if($r = mysqli_fetch_array($sql)) {
	    echo ($r['CodAnime']);
	}else{
	    $_GET["Nome"] = str_replace("'", "", $_GET["Nome"]);
	    $_GET["Nome"] = str_replace('"', "", $_GET["Nome"]);
	    $_GET["Nome"] = str_replace(",", "", $_GET["Nome"]);
        $qr = "INSERT INTO anime(Nome, Categoria, Descricao, genero, Estudio, Ano) VALUES ('".$_GET["Nome"]."','Manga','".$_GET["Descricao"]."','".$_GET["Genero"]."','".$_GET["Estudio"]."',".$_GET["Ano"].")";
        $sql = $GLOBALS["con"]->query($qr);
        $sql =$GLOBALS["con"]->query("SELECT CodAnime FROM anime WHERE Nome='".$_GET["Nome"]."' AND Categoria='Manga'");
    	if($r = mysqli_fetch_array($sql)) {
    	    echo ($r['CodAnime']);
    	}
	}
}

function Func19(){
    header('Access-Control-Allow-Origin: *');
    ini_set('max_execution_time', 300);
    
    $qr = "SELECT Nome,Nomeorig FROM anime WHERE CodAnime=".$_GET["CodAnime"];
    $sql = $GLOBALS["con"]->query($qr);
    if($r = mysqli_fetch_array($sql)){
        if(($r['Nomeorig'])=="" || ($r['Nomeorig'])===null){
            $Nome = ($r['Nome']);
        }else{
            $Nome = ($r['Nomeorig']);
        }
    }
    
    //header("Content-Type: text/txt");
    $_GET["Episodio"] = $_GET["Ep"];
    $Nome =str_replace(" ","+",$Nome);
    if(strpos($_GET["Ep"], 'EP') !== false){
        $_GET["Ep"] =str_replace("EP","episodio+",$_GET["Ep"]);
    }elseif(strpos($_GET["Ep"], 'OVA') !== false){
        $_GET["Ep"] =str_replace("OVA","OVA+",$_GET["Ep"]);
    }
    $useragent = "Opera/9.80 (J2ME/MIDP; Opera Mini/4.2.14912/870; U; id) Presto/2.4.15";
    $pag=0;
    while($pag<50){
        $ch = curl_init ("");
        //hl=en,pt,es (indioma da pesquisa)
        curl_setopt ($ch, CURLOPT_URL, "http://www.google.com/search?hl=pt&tbo=d&site=&source=hp&q=".$Nome."+".$_GET["Ep"]."+Assistir+Online&start=".$pag);
        curl_setopt ($ch, CURLOPT_USERAGENT, $useragent); // set user agent
        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        $output = curl_exec ($ch);
        curl_close($ch);
        $output = explode("/url?q=",$output);
        $count=0;
        foreach($output as $site):
            $count++;
            if($count>1 && count($output)>$count){
                $site = explode('"',$site)[0];
                $site = explode('&amp;sa=',$site)[0];
                if(!IgnoreSite($site)){
                    if(ExtractSrc($site)==0){
                        ReportClear();
                        echo("0");
                        return 0;
                    }
                }
            }
        endforeach;
        $pag=$pag+10;
    }
    echo("1");
}


function ReportClear(){
    $qr = "select CodUsuario FROM report WHERE CodAnime='".$_GET["CodAnime"]."' AND Episodio='".$_GET["Episodio"]."' AND CodErro=1";
    $sql = $GLOBALS["con"]->query($qr);
    while($r = mysqli_fetch_array($sql)){
        $qr2 = "UPDATE usuarios SET Ajudou=Ajudou+1 WHERE CodUsuario='".($r['CodUsuario'])."'";
	       $sql2 = $GLOBALS["con"]->query($qr2);
	       
	       $qr2 = "select Email FROM usuarios WHERE CodUsuario=".($r['CodUsuario']);
        $sql2 = $GLOBALS["con"]->query($qr2);
        if($r2 = mysqli_fetch_array($sql)){
            if(($r2['notificacao'])=="OneSignal"){
                $qr2 = "INSERT INTO mensagens(CodUsuario, De, Titulo, Mensagem, Data) VALUES (".($r['CodUsuario']).",0,'".$Nome." - ".$_GET["Episodio"]."','Episodio foi atualizado com uma nova fonte! <br />Obrigado pelo aviso! <br /><center><b>+1 Colaboração</b></center>Cada ponto de colaboração corresponde a 1 semana de VIP, para fazer a troca entre em contato! Menu>Contatos:EMAIL',CURRENT_TIMESTAMP)";
	                $sql2 = $GLOBALS["con"]->query($qr2);
            }else{
                $subject = $Nome." - ".$_GET["Episodio"];
            	$message = 'Episodio foi atualizado com uma nova fonte! <br />Obrigado pelo aviso! <br /><center><b>+1 Colaboração</b></center>Cada ponto de colaboração corresponde a 1 semana de VIP, para fazer a troca entre em contato! Menu>Conta:TROCAR VIP';
            	$headers = 'From: admin@brasilsenpai.net' . "\r\n" .
                'Reply-To: admin@brasilsenpai.net' . "\r\n" .
                'X-Mailer: PHP/' . phpversion();
            	mail($Email, $subject, $message, $headers);
            }
        }
    }
}

function ExtractSrc($Link){
    $useragent = "Opera/9.80 (J2ME/MIDP; Opera Mini/4.2.14912/870; U; id) Presto/2.4.15";
    $ch = curl_init ("");
    //hl=en,pt,es (indioma da pesquisa)
    curl_setopt ($ch, CURLOPT_URL, $Link);
    curl_setopt ($ch, CURLOPT_USERAGENT, $useragent); // set user agent
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
    $output = curl_exec ($ch);
    curl_close($ch);
    if(strpos($output, '?token=') !== false){
        $source = explode('?token=',$output)[1];
        $source = explode('"',$source)[0];
        $source = explode("'",$source)[0];
        $ch = curl_init(); 
        // set url 
        $Player = $source;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.blogger.com/video.g?token=".$source); 
        
        
        //return the transfer as a string 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
        // $output contains the output string 
        $output = curl_exec($ch);
        if(strpos($output, 'videoplayback?') !== false){
            $source = explode('[{"play_url":"', $output)[1];
            $source = explode('","f', $source)[0];
            // close curl resource to free up system resources 
            curl_close($ch);
            $source = preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/', function ($match) { return mb_convert_encoding(pack('H*', $match[1]), 'UTF-8', 'UCS-2BE'); }, $source);
            $link = explode("videoplayback?id=",$source)[1];
            $link = explode("&itag=",$link)[0];
            $qr = "UPDATE episodios SET Link='".$link."', Player='".$Player."' WHERE CodAnime='".$_GET["CodAnime"]."' AND Episodio='".$_GET["Episodio"]."'";
	        $sql = $GLOBALS["con"]->query($qr);
            return 0;
        }
    }
    return 1;
}
function IgnoreSite($Link){
    $BlockList=[
        "animestc",
        "animesvision",
        "animesonline.online",
        "animesdai.stream",
        "chillingeffects.org",
        "animalog.online"
    ];
    $cont=0;
    while($cont<count($BlockList)){
        if(strpos($Link, $BlockList[$cont]) !== false){
            return true;
        }
        $cont++;
    }
    return false;
}

function TratamentoTitulo($Titulo){
        if(strpos($Titulo, ' - Episódio ')){
            $Nome = explode (' - Episódio ', $Titulo)[0];
            $Episodio = explode (' - Episódio ', $Titulo)[1];
        }else if(strpos($Titulo, ' – Episódio ')){
            $Nome = explode (' – Episódio ', $Titulo)[0];
            $Episodio = explode (' – Episódio ', $Titulo)[1];
        }else if(strpos($Titulo, ' – Episodio ')){
            $Nome = explode (' – Episodio ', $Titulo)[0];
            $Episodio = explode (' – Episodio ', $Titulo)[1];
        }else if(strpos($Titulo, ' Episódio ')!==false){
            $Nome = explode (' Episódio ', $Titulo)[0];
            $Episodio = explode (' Episódio ', $Titulo)[1];
        }else if(strpos($Titulo, ' Episodio ')!==false){
            $Nome = explode (' Episodio ', $Titulo)[0];
            $Episodio = explode (' Episodio ', $Titulo)[1];
        }
        if(strpos( $Episodio, " : " )!==false){
        	$Episodio = explode (' : ', $Episodio)[0];
        }else if(strpos( $Episodio, ":" )!==false){
            $Episodio = explode (':', $Episodio)[0];
        }else if(strpos( $Episodio, " - " )!==false){
            $Episodio = explode (' - ', $Episodio)[0];
        }else if(strpos( $Episodio, "-" )!==false){
            $Episodio = explode ('-', $Episodio)[0];
        }else if(strpos( $Episodio, " – " )!==false){
            $Episodio = explode (' – ', $Episodio)[0];
        }else if(strpos( $Episodio, "–" )!==false){
            $Episodio = explode ('–', $Episodio)[0];
        }
        if(strpos($Titulo, 'Prévia')==false){
            //echo $Titulo.":".explode (' – Episódio ', $post->title)[0]."<br>";
            return $Nome."[,]".$Episodio;
        }else{
            return $Nome."[,]".$Episodio." PREVIA";
        }
}

function CodAnimeGET($Anime){
	$qr = "SELECT CodAnime FROM anime WHERE Categoria='Anime' && Nome='$Anime' || Nomeorig='$Anime'";
	$sql = mysql_query($qr);
	if($r = mysqli_fetch_array($sql)) {
		return ($r['CodAnime']);
	}else{
		return "false";
	}
}

function blogger_extrator($src){
        $ch = curl_init(); 
        // set url 
        curl_setopt($ch, CURLOPT_URL, $src); 
        
        //return the transfer as a string 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
        
        // $output contains the output string 
        $output = curl_exec($ch);
        $source = explode('[{"play_url":"', $output);
        if(!isset($source[1])){
            return null;
        }
        $source = $source[1];
        $source = explode('","f', $source)[0];
        
         // close curl resource to free up system resources 
        curl_close($ch);
        $source = preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/', function ($match) { return mb_convert_encoding(pack('H*', $match[1]), 'UTF-8', 'UCS-2BE'); }, $source);
        if($source!="" && $source!=null){
            return $source;
        }else{
            return null; 
        }
}
function convert_query_to_json($query){
    $rows = array();
    if($query!=null){
        while($r = mysqli_fetch_assoc($query)) {
            $rows[] = $r;
        }
    }
    return $rows;
}
function utf8ize($d) {
    if (is_array($d)) {
        foreach ($d as $k => $v) {
            $d[$k] = utf8ize($v);
        }
    } else if (is_string ($d)) {
        return utf8_encode($d);
    }
    return $d;
}
function manga_cap_ManHost($Nome,$CodAniMan,$Cap){
    $Capitulos = array();
	$Nome = str_replace(" ", "-", $Nome);
	$Nome = str_replace(":", "", $Nome);
	$Nome = str_replace(")", "", $Nome);
	$Nome = str_replace("(", "", $Nome);
	$Nome = str_replace("?", "", $Nome);
	$Nome = str_replace("!", "", $Nome);
	$Nome = str_replace("'", "", $Nome);
	$Nome = str_replace('"', "", $Nome);
	$Nome = str_replace(',', "", $Nome);
	$Nome = str_replace('~', "", $Nome);
	$Nome = str_replace('.', "", $Nome);
	$url="https://mangahost2.com/manga/".$Nome."/".$Cap;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_TIMEOUT, '60'); // in seconds
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $res = curl_exec($ch);
    $htmlcurl = $res;
    $LanLast=true;
    $res = explode('viewerChapter chapters',$htmlcurl);
    if(count($res)<=1){
        return array();
    }
    $res = $res[1];
    $res = explode(' - #',$res);
    $cont = 0;
    //echo 'INSERT INTO capitulos (CodAnime, Capitulo) VALUES ';
    foreach ($res as $temp) {
        $temp = explode('</option>',$temp)[0];
        if(is_numeric($temp)){
            array_push($Capitulos,$temp);
            $sql = $GLOBALS["con"]->query("SELECT Data FROM capitulos WHERE CodAniMan=$CodAniMan AND Episodio=$temp");
            if($r = mysqli_fetch_array($sql)) {
        		                
            }else{
                $sql = $GLOBALS["con"]->query("INSERT INTO capitulos(CodAniMan, Episodio, Fonte, Data) VALUES ($CodAniMan,$temp,'MangaHost',null)");
                if($LanLast){
                    $sql = $GLOBALS["con"]->query("UPDATE capitulos SET Data=CURRENT_TIMESTAMP WHERE CodAniMan=$CodAniMan AND Episodio=$temp");
                        $LanLast=false;
                }
                            
    		}
        }
        $cont++;
    }
    sort($Capitulos);
    return $Capitulos;
}


//mysql_close($GLOBALS["con"]);
?>