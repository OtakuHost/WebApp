'use strict';
var aux = new Object();
//Variavel usada para obter uma resposta
//file:///android_asset/index.html
aux.call_result = null;
aux.Screen = new Array();
(aux.Screen).push('lancamentos');
aux.Pasta = WebApp.DiretorioDownload()+'/Otaku Host';
aux.Type = 'Anime';
aux.AniManGenero = "";
aux.AniManIndex_Fav = null;
aux.Pag = 0;
aux.WebPlayer = false;
aux.FireBase = null;

//Fontes de animes e mangás
aux.Fonts = new Object();
aux.AniManSource = new Object();

//Fontes de videos
aux.FontsVids = new Object();


//Lançamentos
aux.inicial = new Object();
aux.inicial['Manga'] = new Array();
aux.inicial['Anime'] = new Array();
aux.BibliotecaIdioma = new Object();

//Anuncios
aux.InterstitialTime = 0;
aux.InterstitialHtml = "";

//Configuração de idiomas
aux.Bandeiras = {
    "PT-Br":"🇧🇷",
    "En-US":"🇱🇷"
};
aux.Generos = {
    "PT-Br":['Aventura','Escolar','Ecchi','Esporte','Comedia','Drama','Fantasia','Harem','Mecha','Shoujo','Seinen','Shounen','Romance','Terror'],
    "En-US":['Adventure', 'School', 'Ecchi', 'Sport', 'Comedy', 'Drama', 'Fantasy', 'Harem', 'Mecha', 'Shoujo', 'Seinen', 'Shounen' , 'Romance ','Horror']
};

//inject
aux.Biblioteca = null;
aux.EpTratamento = [' ', ':','-'];
/*
    - CONTROLADORES DE CHAMADA AO SISTEMA
*/
//1 - Caso estejamos esperando uma chamada async do sistema, devemos esperar que ela termine para que possamos entrar.
aux.android_sinaleiro = true;
//Quais elementos de chamada devemos exibir modal de loading?
aux.android_callModal = ['ajax'];
//Chamada não Async, save_file_manga ira chamar outra função que se tornara 'recursiva'
aux.android_callIgnore = ['save_file_manga','assistir','open_link','exit','download','ads','analytics','interstitial_show','interstitial_close','inject'];
//bloqueador de paginação, ele vira true somente em 'generos' e 'pesquisa'
aux.PaginacaoDetectCheck = false;

//Controles de download
aux.DownloadsConfig = new Object();
//Usuario pode pausar todos downloads
aux.DownloadsConfig.Farol = true;
//Controle sobre requisição de download
aux.DownloadsConfig.Request = false;
//File, (Nome,Capitulo,Sources)
aux.DownloadsConfig.Fila = new Array();

aux.Data = new Date();
aux.Data = (aux.Data).getFullYear()+'-'+String((aux.Data).getMonth() + 1).padStart(2, '0')+'-'+String((aux.Data).getDate()).padStart(2, '0');

$(document).ready(async function(){
    M.AutoInit();
    $('#loading').modal('open');   
    $('#progress').modal({ending_top: '50%'});
    $('#SlideDownload').sidenav({edge:'right'});
    $('#loading').modal({
		dismissible: false
    });
    $("#login").modal({
        onCloseEnd : function(){
            aux.CodUserQuerest = undefined;
        }
    });
    $("#epcap").modal({
        onCloseEnd : function(){
            $("#fontsopc").html("");
        }
    });
    $('#progress').modal({
		dismissible: false
    });
    $( "#list_epcap" ).change(function() {
        $("#fontsopc").html("");
    });
    $( "#nome_pesquisa" ).keypress(function( event ) {
        if ( event.which == 13 ) {
            $('#pesquisa ul').html("");
            pesquisa(1);
        }
    });
    $('#temporada input[type="checkbox"]').on('change', function() {
        $('#temporada input[type="checkbox"]').not(this).prop('checked', false);
    });
    $(document).on('click', '#toast-container .toast', function() {
        $(this).fadeOut(function(){
            $(this).remove();
        });
    });
    
    //Carregar Fontes
    load_fonts_Mangas();
    load_fonts_Animes();
    
    screen('lancamentos');
    favoritos('update');
    if(await WebApp.DirExist(aux.Pasta)==false){
        await WebApp.CreateDir(aux.Pasta);
        await WebApp.CreateDir(aux.Pasta+'/capas');
        await WebApp.CreateDir(aux.Pasta+'/mangas');
        if(await WebApp.DirExist(aux.Pasta)==false){
            alert(908);
            return null;
        }
    }
   
    //Carregar dados de Download, caso usuario tenha fechado app sem terminar todos download'
    if(localStorage.getItem("DownloadsFila")!=null){
        aux.DownloadsConfig.Fila = JSON.parse(localStorage.getItem("DownloadsFila"));
    }
    
    //Controlador de rolagem de paginas generos
    $("#genero").scroll(async function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            await generos_pesquisa(aux.Pag+1);
        }
    });

    $("#genero").on('click', 'input[type="checkbox"]', function() {      
        $('input[type="checkbox"]').not(this).prop('checked', false);      
    });

    //Controlador de rolagem de paginas pesquisa
    $("#pesquisa").scroll(async function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight-1) {
            await pesquisa(aux.Pag+1);
        }
    });

    //Capturar erros
    $.Deferred.exceptionHook = function (err, stackTrace) {
        // 'err' is what you throw in your deferred's catch.
        //$('.modal').modal('close');
        //alert('J'+err);
    }

    //Exibir fontes para selecionar. Manga
    $("#list_MangaSources").html(`<option value="null" selected>Mangá</option>`);
    for(let cont=0;cont<(aux.Fonts['Manga']).length;cont++){
        $("#list_MangaSources").append(`
            <option value="${cont}">${aux.Bandeiras[aux.Fonts['Manga'][cont].Idioma]} ${aux.Fonts['Manga'][cont].Nome}</option>
        `);
    }

    //Exibir fontes para selecionar. Anime
    $("#list_AnimesSources").html(`<option value="null" selected>Anime</option>`);
    for(let cont=0;cont<(aux.Fonts['Anime']).length;cont++){
        $("#list_AnimesSources").append(`
            <option value="${cont}">${aux.Bandeiras[aux.Fonts['Anime'][cont].Idioma]} ${aux.Fonts['Anime'][cont].Nome}</option>
        `);
    }

    if(localStorage.getItem("AniManSource_Manga")!=null){
        aux.AniManSource['Manga'] = localStorage.getItem("AniManSource_Manga");
        $("#list_MangaSources").val(aux.AniManSource['Manga']).attr("selected", "selected");
    }else{
        $("#Fontes_Config").modal('open');
    }
    if(localStorage.getItem("AniManSource_Anime")!=null){
        aux.AniManSource['Anime'] = localStorage.getItem("AniManSource_Anime");
        $("#list_AnimesSources").val(aux.AniManSource['Anime']).attr("selected", "selected");
    }else{
        $("#Fontes_Config").modal('open');
    }
    WebApp.Ajax('https://otakuhostapp.blogspot.com/p/versaoattt.html',''+function(Code,Result){
        Result = $($.parseHTML(htmlDecode(Result)));
        if(WebApp.AppVersion()+0<Result.find('#versao').text()){
            $("#nova_versao h5").text("Otaku Host V"+Result.find('#versao').text());
            $("#nova_versao .desc").html(Result.find('#info').html());
            $("#nova_versao .link").attr('href',Result.find('#link').text());
            $("#nova_versao").modal("open");
        }
    });

    //WebPlayer email
    if(localStorage.getItem("Email")!=null){
        $("#email_webPlayer").val(localStorage.getItem("Email"));
        $("#web_PlayerModal p").html(`<b>Codigo</b>: `+localStorage.getItem("Codigo"));
        aux.FireBase = new Firebase('https://otakuhostapp-d36e8.firebaseio.com/user/'+md5(localStorage.getItem("Email"))+'-'+localStorage.getItem("Codigo"));
    }

    await historico(null);
    await update_biblioteca();
    await update_download_view();
    await process_downloads_mangas(null,null);
});

async function email_set(){
    if(($("#email_webPlayer").val()).length>5){
        localStorage.setItem("Email",$("#email_webPlayer").val());
        localStorage.setItem("Codigo",Math.floor(Math.random() * 999) + 1 );
        $("#web_PlayerModal p").html(`<b>Codigo</b>: `+localStorage.getItem("Codigo"));
        aux.FireBase = new Firebase('https://otakuhostapp-d36e8.firebaseio.com/user/'+md5(localStorage.getItem("Email"))+'-'+localStorage.getItem("Codigo"));
    }
}

async function configurar_fontes(){
    if($("#list_AnimesSources").val()=="null" || $("#list_MangaSources").val()=="null"){
        alert("Selecione uma fonte!");
    }else{
        localStorage.setItem("AniManSource_Manga",$("#list_MangaSources").val());
        localStorage.setItem("AniManSource_Anime",$("#list_AnimesSources").val());
        aux.AniManSource['Manga'] = localStorage.getItem("AniManSource_Manga");
        aux.AniManSource['Anime'] = localStorage.getItem("AniManSource_Anime");
        aux.inicial['Manga'] = new Array();
        aux.inicial['Anime'] = new Array();
        $("#Fontes_Config").modal('close');
    }
}

async function noticias(){
    loading(true);
    WebApp.Ajax('https://ptanime.com/feed/',''+function(Code,Result){
        if(Code==200){
            aux.Noticias = htmlDecode(Result);
            $("#noticias").html("");
            aux.Noticias = (aux.Noticias).split("<item>");
            let titulo="",
                img="",
                text="";
            console.log("tamanho: "+ console.log("Hello World")); 
            for(let cont=1;cont<(aux.Noticias).length;cont++){
                titulo = (aux.Noticias[cont]).split("<title>")[1];
                titulo = titulo.split("</title>")[0];
                
                text = (aux.Noticias[cont]).split("<content:encoded>")[1];
                text = text.split("</content:encoded>")[0];
                text = text.split("href=").join("href=");
                text = text.split("width=").join("w=");
                text = text.split("height=").join("h=");
                text = text.split("style=").join("s=");
                
                img = text.split('src="')[1];
                img = img.split('"')[0];
                $("#noticias").append(`
                    <div class="card">
                        <div class="card-image waves-effect waves-block waves-light">
                        <img class="activator" src="${img}">
                        </div>
                        <div class="card-content grey darken-3">
                        <span class="card-title activator white-text">${titulo}<i class="material-icons right">more_vert</i></span>
                        </div>
                        <div class="card-reveal black-text">
                        <span class="card-title grey-text text-darken-4">${titulo}<i class="material-icons right">close</i></span>
                        <div class="corpo">${text}</div>
                        </div>
                    </div>
                `);
            }
            screen('noticias');
        }
        loading(false);
    });
    
}

//Controlador de anuncio full screen
async function interstitialShow(){
    console.log("Call intensival");
    WebApp.Ads_Intensival();
}

//Atualiza o sistema de visualização de download
async function update_download_view(){
    $("#SlideDownload").html("");
    for(let cont=0;cont<(aux.DownloadsConfig.Fila).length;cont++){
        $("#SlideDownload").append(`
            <li class="collection-item">
                <div class="row">
                    <div class="col s3 l3 m3">
                        <img class="cover" src="${aux.DownloadsConfig.Fila[cont].Img}">
                    </div>
                    <div class="col s9 l9 m9">
                        <b>${aux.DownloadsConfig.Fila[cont].Nome} - ${aux.DownloadsConfig.Fila[cont].Capitulo}</b><br>
                        <div class="chip">
                            <img src="download_icon.png" alt="Contact Person">
                            <i class="porcent">0</i>%
                            <i onclick="process_downloads_mangas('delet',aux.DownloadsConfig.Fila[${cont}]);" class="right material-icons">close</i>
                        </div>
                    </div>
                </div>
            </li>
        `);
    }
}

//Le ou deleta capituloda biblioteca
async function biblioteca_cap(Acao){
    if(Acao=='read'){
        aux.MangasSources = await WebApp.GetFiles(`${aux.Pasta}/mangas/${aux.AniMan}/${$("#biblioteca_caps select").val()}`);
        aux.MangasSources = (aux.MangasSources).split('[#]');
        (aux.MangasSources).sort();
        $("#leitor").html("");
        $(".modal").modal('close');
        screen('leitor');
        for(let cont=0;cont<(aux.MangasSources).length;cont++){
            $("#leitor").append(`<img src="${aux.MangasSources[cont]}">`);
        }
        //WebApp.StatusBar('false');
    }else{
        let check = await WebApp.DeleteDir(`${aux.Pasta}/mangas/${aux.AniMan}/${$("#biblioteca_caps select").val()}/`);
        biblioteca_caps(aux.AniMan);
    }

}

//Exibe capitulos existentes na biblioteca
async function biblioteca_caps(Manga){
    let caps = await WebApp.GetFiles(aux.Pasta+'/mangas/'+Manga);
    $("#biblioteca_caps select .cap").html("");
    if(caps!=""){
        caps = caps.split("/storage/emulated/0/Otaku Host/mangas/"+Manga+"/").join("");
        caps = caps.split('[#]');
        caps.sort();
        for(let cont=0;cont<caps.length;cont++){
            if(!(caps[cont]).includes(".jpg")){
                $("#biblioteca_caps select .cap").append(`
                    <option value="${caps[cont]}">${caps[cont]}</option>
                `);
            }
        }
        $('#biblioteca_caps').modal('open');
    }else{
        $('#biblioteca_caps').modal('close');
        await WebApp.DeleteDir(`${aux.Pasta}/mangas/${Manga}/`);
        await update_biblioteca();
        await biblioteca();
    }
}

//Exibe a biblioteca de mangás
async function biblioteca(){
    $("#biblioteca ul").html("");
    for(let cont=0;cont<(aux.Biblioteca).length;cont++){
        $("#biblioteca ul").append(`
            <li class="col s4 m3 l2" value="${aux.Biblioteca[cont]}">
                <div class="card-image">
                    <img src="${decodeURI(`/storage/emulated/0/Otaku Host/mangas/${aux.Biblioteca[cont]}/capa.jpg`)}"/>
                    <span class="titulo">${aux.Biblioteca[cont]}</span>
                </div>
            </li>
        `);
    }
    $("#biblioteca ul li").on("click", function() {
        aux.AniMan = $(this).attr("value");
        biblioteca_caps(aux.AniMan);
    });
    screen('biblioteca');
    cover_height();
}

//Atualiza biblioteca
async function update_biblioteca(){
    aux.Biblioteca = await WebApp.GetFiles(aux.Pasta+'/mangas');
    console.log(aux.Biblioteca);
    if(aux.Biblioteca==""){
        aux.Biblioteca = new Array();
    }else{
        aux.Biblioteca = (aux.Biblioteca).split("/storage/emulated/0/Otaku Host/mangas/").join("");
        aux.Biblioteca = (aux.Biblioteca).split('[#]');
    }
    return true;
}

function android_process_downloads_mangas(){
    aux.DownloadsConfig.Request = false;
    process_downloads_mangas(null,null);
}

//Sistema de processamento de download.
/*
    add - Adiciona capitulo a fila de download,(Nome,CAP01,Sources)
    devar - Deleta da pagina de download, (Nome,CAP01)
    null - Processa download, (null)
*/
async function process_downloads_mangas(Acao,Dado){
    if(Acao=='add'){
        for(let cont=0;cont<(aux.DownloadsConfig.Fila).length;cont++){
            if(aux.DownloadsConfig.Fila[cont].Nome==Dado.Nome && aux.DownloadsConfig.Fila[cont].Capitulo==Dado.Capitulo){
                M.toast({html:'Capitulo ja existe na fila de download! '});
                return false;
            }
        }
        (aux.DownloadsConfig.Fila).push(Dado);
        M.toast({html:'Adicionado a fila!'});
        await update_download_view();
        //Não existe downlod's sendo processado
        if(aux.DownloadsConfig.Request==false){
            process_downloads_mangas(null,null);
        }
        localStorage.setItem('DownloadsFila', JSON.stringify(aux.DownloadsConfig.Fila));
        return true;
    }else if(Acao=='delet'){
        for(let cont=0;cont<(aux.DownloadsConfig.Fila).length;cont++){
            if(aux.DownloadsConfig.Fila[cont].Nome==Dado.Nome && aux.DownloadsConfig.Fila[cont].Capitulo==Dado.Capitulo){
                (aux.DownloadsConfig.Fila).splice(cont, 1);
                localStorage.setItem('DownloadsFila', JSON.stringify(aux.DownloadsConfig.Fila));
                await update_download_view();
                return true;
            }
        }
        return false;
    }else{
        //(Farol= Controle do usuario, Fila de Download, Processando)
        if(aux.DownloadsConfig.Farol && (aux.DownloadsConfig.Fila).length>0 && aux.DownloadsConfig.Request==false){
            //Visamos que um download esta sendo feito.
            aux.DownloadsConfig.Request = true;
            //Verificar se a capa e a pasta ja existem
            if(!(aux.Biblioteca).includes(aux.DownloadsConfig.Fila[0].Nome)){
                await WebApp.CreateDir(aux.Pasta+'/mangas/'+aux.DownloadsConfig.Fila[0].Nome);
                await WebApp.SaveFile(`${aux.Pasta}/mangas/${aux.DownloadsConfig.Fila[0].Nome}/capa.jpg`,aux.DownloadsConfig.Fila[0].Img);
                await update_biblioteca();
            }
            for(let cont=0;cont<(aux.DownloadsConfig.Fila[0].Sources).length;cont++){
                if(aux.DownloadsConfig.Fila[0].Sources[cont]!=null){
                    if(cont==0){
                        //if(await BrasilSenpai.DirExist(aux.Pasta)==false){}
                        await WebApp.CreateDir(`${aux.Pasta}/mangas/${aux.DownloadsConfig.Fila[0].Nome}/${aux.DownloadsConfig.Fila[0].Capitulo}`);
                        console.log("Pasta capitlo OK");
                    }
                    //save_file_manga
                    WebApp.SaveManga(`${cont}.jpg`,aux.DownloadsConfig.Fila[0].Sources[cont],`${aux.Pasta}/mangas/${aux.DownloadsConfig.Fila[0].Nome}/${aux.DownloadsConfig.Fila[0].Capitulo}/`);
                    aux.DownloadsConfig.Fila[0].Sources[cont] = null;
                    $("#SlideDownload .porcent").first().text(await porcentagem(cont+1,(aux.DownloadsConfig.Fila[0].Sources).length));
                    console.log("Pagº"+cont);
                    return true;
                }
            }
            console.log("Cap OK");
            //Download concluido, vamos remover da lita
            aux.DownloadsConfig.Request=false;
            await process_downloads_mangas('delet',aux.DownloadsConfig.Fila[0]);
            return await process_downloads_mangas(null,null);
        }
    }
}

async function loading(Check){
    if(Check){
        await $('#loading').modal('open');
        await sleep(1000)
        return true;
    }else{
        await $('#loading').modal('close');
    }
}

function GenFilter(Element){
    if($(Element).is(":checked")){
        aux.Generos[aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Idioma];
        aux.AniManGenero = aux.Generos[aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Idioma][$(Element).attr("value")];
        $('#SlideGenero input[type="checkbox"]').not(Element).prop('checked', false);
    }else{
        aux.AniManGenero="";
    }
}

async function generos_pesquisa(pag){
    if(aux.AniManGenero!=""){
        //aux.PaginacaoDetectCheck = false;
        if(pag==1){
            $('#genero ul').html("");
        }
        aux.Pag = pag;
        loading(true);
        await aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Generos(aux.Pag);
    }else{
        M.toast({html:'Você precisa selecionar um genero!'});
    }
}


//Pesquis de animes/Mangas
async function pesquisa(pag){
    aux.Pag = pag;
    if(pag==1){
        screen('pesquisa');
        $("#pesquisa ul").html("");
    }
    await aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Pesquisa(aux.Pag);
    //Na parte de pequisa, todo fluxo vai para sinopse.
}



//Exibir alertas de erros
function alert(code){
    if(biblioteca_alerts[code]==undefined){
        $('#alert .modal-content').html(`
            <i class="large material-icons">sentiment_neutral</i><br>
            Erro inexperado...<br>
            Codigo: ${code}
        `);
    }else{
        $('#alert .modal-content').html(biblioteca_alerts[code]);
    }
    $('#alert').modal('open');
}

//Puxar fontes
async function fontes(){
    aux.FontSelect = null;
    localStorage.setItem('Hist-'+aux.AniMan.Nome+'-'+aux.AniMan.Type, $("#list_epcap").val());
    $("#fontsopc").html("");
    historico($("#list_epcap").val());
    //Parte para extração de paginas.
    if(aux.AniMan.Type=='Manga'){
        aux.Fonts['Manga'][aux.AniMan['IndexSource']].Sources($("#list_epcap").val());
    }else{
        //Carrega todos links de video.
        loading(true);
        let HD,Strick;
        WebApp.Ajax($("#list_epcap").val(),''+async function(Code,Result){
            aux.FontsVids = HtmlToVideo(htmlDecode(Result));
            for(let cont=0;cont<(aux.FontsVids).length;cont++){
                if(aux.FontsVids[cont][1]){
                    HD = "";
                }else{
                    HD = "HD";
                }
                $("#fontsopc").append(`<a value="${cont}" onclick="font_set(${cont})" class="waves-effect waves-light btn">Fonte ${cont} ${HD}</a>`);
            }
            loading(false);
        })
    }
    interstitialShow()
}

async function blogger_extrair(html){
    html = html.split(`[{"play_url":"`);
    if(html.length<=1){
        alert(2);
        return null;
    }
    html = html[1];
    html = html.split(`","f`);
    html = JSON.parse('"'+html[0]+'"');
    return html;
}

//Exibir episodio ou manga, online ou download
async function font_set(index){
    $(`#fontsopc a`).removeClass("deep-orange accent-4");
    $(`#fontsopc a[value='${index}']`).addClass("deep-orange accent-4");
    aux.FontSelect = index;
    if(aux.Type=='Anime'){
        if(aux.FontsVids[index][0]==null){
            alert(2);
            return null;
        }
        //Definir se e uma subfonte ou não.
        if(aux.FontsVids[index][1]){
            //loading(true);
            aux.FontsIndex = index;
            console.log(aux.FontsVids);
            WebApp.Ajax(aux.FontsVids[index][0],''+async function(Code,Result){
                let temp = null;
                if(Code==200){
                    temp = await HtmlToVideo(await htmlDecode(Result));
                    if(temp=="" || temp==null || temp.length<=0){
                        aux.FontsVids[aux.FontSelect][0]=null;
                        console.log("FALHA");
                    }else{
                        for(let cont=0;cont<temp.length;cont++){
                            if(cont<=0){
                                aux.FontsVids[aux.FontsIndex][0] = temp[cont][0];
                                aux.FontsVids[aux.FontsIndex][1] = temp[cont][1];
                            }else{
                                (aux.FontsVids).push([temp[cont][0],temp[cont][1]]);
                            }
                        }
                        $("#fontsopc").html("");
                        for(let cont=0;cont<(aux.FontsVids).length;cont++){
                            if(aux.FontsVids[cont][1]){
                                HD = "";
                            }else{
                                HD = "HD";
                            }
                            console.log("click..");
                            $("#fontsopc").append(`<a value="${cont}" onclick="font_set(${cont})" class="waves-effect waves-light btn">Fonte ${cont} ${HD}</a>`);
                        }
                    }
                    font_set(aux.FontsIndex);
                }
                loading(false);
                console.log(Code);
            });
        }else{
            if($("#sinopse nav .downplay").attr("value")=="false"){
                await WebApp.Download(aux.AniMan.Nome+' - '+$("#list_epcap option:selected").html()+'.mp4',aux.FontsVids[index][0]);
                M.toast({html: `Download adicionado, você pode ver na barra de statos.`});
            }else{
                if($('#check_webplayer').is(":checked") && aux.FireBase!==null){
                    aux.FireBase.push({name:"video_play",text:aux.FontsVids[index][0]});
                    setTimeout(function(){ 
                        aux.FireBase.remove(function(error){
                            //do stuff after removal
                          });
                    }, 3000);
                }else{
                    await WebApp.Assistir(aux.FontsVids[index][0]);
                }
            }
        }
    }else{
        await manga_source_imgs(aux.FontsMangas[index].Link,aux.AniMan.Nome,aux.EpCapSelect,aux.FontsMangas[index].Replace,aux.FontsMangas[index].Nome);
    }

}

function Make_Url_Manga(index,Nome,Cap){
    Nome = Nome.toLowerCase();
    for(let cont=0;cont<(aux.FontsMangas[index].Replace).length;cont++){
        Nome = Nome.split((aux.FontsMangas[index].Replace)[cont][0]).join((aux.FontsMangas[index].Replace)[cont][1]);
    }
    Nome = ((aux.FontsMangas[index].Link)).split('#nome#').join(Nome);
    Nome = Nome.split('#cap#').join(Cap);
    return Nome;
}

//Processamento de mangás
async function Ler_Baixar_Mangas(Sorces){
    if($("#sinopse nav .downplay").attr("value")=="false"){
        var temp = new Object();
        temp.Nome = aux.AniMan.Nome;
        temp.Capitulo = aux.EpCapSelect;
        temp.Sources = Sorces;
        temp.Img = aux.AniMan.Img;
        await process_downloads_mangas('add',temp);
        M.toast({html: `Download adicionado, clique no icone de download no topo!`});
    }else{
        $("#leitor").html("");
        $(".modal").modal('close');
        screen('leitor');
        aux.MangasSources = Sorces;
        for(let cont=0;cont<(Sorces).length;cont++){
            $("#leitor").append(`<img src="${Sorces[cont]}">`);
        }
    }
}

/*
    action: exist,add_delet,update
*/
async function favoritos(Action){
    if(Action=="update"){
        if(localStorage.getItem('Favoritos')===null){
            aux.Favoritos = new Array();
        }else{
            aux.Favoritos = JSON.parse(localStorage.getItem('Favoritos'));
        }
        aux.FavCheck = new Array();
        for(let cont=0;cont<(aux.Favoritos).length;cont++){
            (aux.FavCheck).push(`${aux.Favoritos[cont].Nome}-${aux.Favoritos[cont].Type}`);
        }
        return null;
    }else if(Action=="add_delet"){
        let index = null;
        for(let cont=0;cont<(aux.Favoritos).length;cont++){
            if(aux.Favoritos[cont].Nome==aux.AniMan.Nome && aux.Favoritos[cont].Type==aux.AniMan.Type){
                index=cont;
            }
        }
        if(index==null){
            (aux.FavCheck).push(`${aux.AniMan.Nome}-${aux.AniMan.Type}`);
            (aux.Favoritos).push(aux.AniMan);
            $("#sinopse nav .fav i").text('favorite');
            await WebApp.SaveFile(`${aux.Pasta}/capas/${md5(aux.AniMan.Nome+'-'+aux.AniMan.Type)}.jpg`,aux.AniMan.Img);
            index=1;
            M.toast({html: `Adicionado!`});
        }else{
            (aux.FavCheck).splice(index, 1);
            (aux.Favoritos).splice(index, 1);
            $("#sinopse nav .fav i").text('favorite_border');
            await WebApp.DeleteFile(`${aux.Pasta}/capas/${md5(aux.AniMan.Nome+'-'+aux.AniMan.Type)}.jpg`);
            index=0;
            M.toast({html: `Removido!`});
        }
        localStorage.setItem('Favoritos', JSON.stringify(aux.Favoritos));
        return null;
    }else{
        let check = false;
        for(let cont=0;cont<(aux.Favoritos).length;cont++){
            if(aux.Favoritos[cont].Nome==aux.AniMan.Nome && aux.Favoritos[cont].Type==aux.AniMan.Type){
                check=true;
            }
        }
        return check;
    }
}

function cover_height(){
    if(aux.Screen[(aux.Screen).length-1]=="lancamentos" && aux.Type=="Anime"){
        $(`.page-content li`).height($(`#${aux.Screen[(aux.Screen).length-1]} .page-content li`).width()*0.7);
    }else{
        $(`.page-content li`).height($(`#${aux.Screen[(aux.Screen).length-1]} .page-content li`).width()*1.5);
        if(aux.Type=="Anime"){
            $(`#anime_manga_lac .page-content li`).height($(`#${aux.Screen[(aux.Screen).length-1]} .page-content li`).width()*0.7);
        }
    }
    if(aux.Screen[(aux.Screen).length-1]=="pesquisa"){
        $("#pesquisa li").unbind();
        $("#pesquisa li").on("click", function() {
            aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Sinopse($(this).attr('value'));
        }); 
    }else if(aux.Screen[(aux.Screen).length-1]=="genero"){
        $("#genero .page-content li").on( "click", function() {
            aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Sinopse($(this).attr('value'));
        });
    }
}

//Processar favoritos
async function swap_fav(Type){
    $('#anime_manga_fav ul').html('');
    aux.Type = Type;
    screen('favoritos');
    await sleep(300);
    $('.swap').text(Type);
    for(let cont=0;cont<(aux.Favoritos).length;cont++){
        if(aux.Favoritos[cont].Type==Type){
            $('#anime_manga_fav ul').append(`
                <li class="col s4 m3 l2 AniMan_Sinopse" value="${cont}">
                    <div class="card-image">
                        <img src="file://${aux.Pasta}/capas/${md5(aux.Favoritos[cont].Nome+'-'+aux.Favoritos[cont].Type)}.jpg">
                        <span class="titulo">${aux.Favoritos[cont].Nome}</span>
                    </div>
                </li>
            `);
        }
    }
    await cover_height();
    $(".page-content .AniMan_Sinopse").on( "click", function() {
        let cont = $(this).attr('value');
        aux.AniManIndex_Fav = aux.Favoritos[cont].IndexSource;
        aux.Fonts[aux.Favoritos[cont].Type][aux.Favoritos[cont].IndexSource].Sinopse(aux.Favoritos[cont].Link);
    });
}

//Controlador de telas
async function screen(x){
    M.Toast.dismissAll();
    $('.sidenav').sidenav('close');
    $(".screen").hide();
    $(".screen_"+x).show();

    $("#"+x).show();
    if((aux.Screen).length==0 || aux.Screen[(aux.Screen).length-1]!=x){
        (aux.Screen).push(x);
    }
    aux.PaginacaoDetectCheck = false;
    await WebApp.Analytics(x+"V6.1");
}

function voltar(){
    if((aux.Screen).length>1){
        if(aux.Screen[(aux.Screen).length-1]=='leitor'){
            //WebApp.StatusBar('true');
        }
        (aux.Screen).splice((aux.Screen).length-1, 1);
    }else{
        WebApp.Exit();
    }
    $('.modal').modal('close');
    screen(aux.Screen[(aux.Screen).length-1]);
}

//Carregar Historico
async function historico(link){
    if(link==null){
        if(localStorage.getItem("LinkHistorico")!=null){
            aux.LinkHistorico = (localStorage.getItem("LinkHistorico")).split(",");
        }else{
            aux.LinkHistorico = new Array();
        }
    }else{
        if(!(aux.LinkHistorico).includes(link)){
            (aux.LinkHistorico).push(link);
            localStorage.setItem("LinkHistorico",(aux.LinkHistorico).join(","));
        }
    }
}


async function load_cap_ep(CapEp){
    aux.FontSelect = null;
    aux.EpCapSelect = $(CapEp).text();
    $("#fontsopc").html("");
    $(CapEp).addClass("visited");
    historico($(CapEp).attr("value"));
    //Parte para extração de paginas.
    if(aux.AniMan.Type=='Manga'){
        aux.Fonts['Manga'][aux.AniMan['IndexSource']].Sources($(CapEp).attr("value"));
    }else{
        //Carrega todos links de video.
        loading(true);
        let HD,Strick;
        WebApp.Ajax($(CapEp).attr("value"),''+async function(Code,Result){
            aux.FontsVids = HtmlToVideo(htmlDecode(Result));
            for(let cont=0;cont<(aux.FontsVids).length;cont++){
                if(aux.FontsVids[cont][1]){
                    HD = "";
                }else{
                    HD = "HD";
                }
                $("#fontsopc").append(`<a value="${cont}" onclick="font_set(${cont})" class="waves-effect waves-light btn">Fonte ${cont} ${HD}</a>`);
            }
            $("#epcap").modal("open");
            loading(false);
        })
    }
    interstitialShow()
}


//Carregar sinopse anime/manga
async function sinopse(){
    //Registramos o index da fonte.
    if(aux.AniManIndex_Fav!==null){
        aux.AniMan['IndexSource'] = aux.AniManIndex_Fav;
        aux.AniManIndex_Fav = null;
    }else{
        aux.AniMan['IndexSource'] = aux.AniManSource[aux.AniMan.Type];
    }
    $("#epcap .episodio").html("");
    $("#epcap .cap").html("");
    $("#sinopse h5").text(aux.AniMan.Nome);
    $("#sinopse .inf").html(`
        <p><b>Tipo</b>: ${aux.AniMan.Type}</p>
        <p><b>Fonte:</b> ${aux.Fonts[aux.AniMan.Type][aux.AniMan['IndexSource']].Nome}</p>
        ${aux.AniMan['inf']}
    `);
    $("#sinopse img").attr('src', aux.AniMan.Img);
    $("#sinopse .generos").html("");
    for(let cont=0;cont<(aux.AniMan.Generos).length;cont++){
        $("#sinopse .generos").append(`<span class="chip">${aux.AniMan.Generos[cont]}</span>`);
    }
    let episodio = new Object();
    episodio.ep = false;
    episodio.cap = false;
    $("#epcap .ep").html("");
    $("#epcap .cap").html("");
    $("#Cap_Ep_Ova").html("");
    for(let cont=0;cont<(aux.AniMan.Episodios).length;cont++){
        episodio.ep = true;
        $("#epcap .ep").append(`<option value="${aux.AniMan.Episodios[cont].Link}">${aux.AniMan.Episodios[cont].Ep}</option>`);
        if((aux.LinkHistorico).includes(aux.AniMan.Episodios[cont].Link)){
            $("#Cap_Ep_Ova").append(`<a onclick="load_cap_ep($(this))" class="btn-small btn-CapEp visited" value="${aux.AniMan.Episodios[cont].Link}">${aux.AniMan.Episodios[cont].Ep}</a>`);
        }else{
            $("#Cap_Ep_Ova").append(`<a onclick="load_cap_ep($(this))" class="btn-small btn-CapEp" value="${aux.AniMan.Episodios[cont].Link}">${aux.AniMan.Episodios[cont].Ep}</a>`);
        }
    }
    for(let cont=0;cont<(aux.AniMan.Capitulos).length;cont++){
        episodio.cap = true;
        $("#epcap .cap").append(`<option value="${aux.AniMan.Capitulos[cont].Link}">${aux.AniMan.Capitulos[cont].Cap}</option>`);
        if((aux.LinkHistorico).includes(aux.AniMan.Capitulos[cont].Link)){
            $("#Cap_Ep_Ova").append(`<a onclick="load_cap_ep($(this))" class="btn-small btn-CapEp visited" value="${aux.AniMan.Capitulos[cont].Link}">${aux.AniMan.Capitulos[cont].Cap}</a>`);
        }else{
            $("#Cap_Ep_Ova").append(`<a onclick="load_cap_ep($(this))" class="btn-small btn-CapEp" value="${aux.AniMan.Capitulos[cont].Link}">${aux.AniMan.Capitulos[cont].Cap}</a>`);
        }
    }

    if(episodio.ep){
        $("#epcap .ep").show();
    }else{
        $("#epcap .ep").hide();
    }

    if(episodio.cap || aux.AniMan.Type=="Manga"){
        $("#epcap .cap").show();
        //$("#sinopse .type_ep").text("Capitulos.");
    }else{
        $("#epcap .cap").hide();
        //$("#sinopse .type_ep").text("Episodios/Ovas.");
    }

    $("#sinopse .descricao").text(aux.AniMan.Descricao);
    if(await favoritos('exist')){
        $("#sinopse nav .fav i").text('favorite');
    }else{
        $("#sinopse nav .fav i").text('favorite_border');
    }
        
    if(localStorage.getItem('Hist-'+aux.AniMan.Nome+'-'+aux.AniMan.Type)!=null){
        $("#list_epcap").val(localStorage.getItem('Hist-'+aux.AniMan.Nome+'-'+aux.AniMan.Type)).attr("selected", "selected");
    }

    $("#mode_epcap").prop("checked",false);
    screen('sinopse');
}

async function mode_downloadassistir(){
    if($("#sinopse nav .downplay").attr("value")=="true"){
        $("#sinopse nav .downplay").attr("value",false)
        $("#sinopse nav .downplay i").text("cloud_download")
        M.toast({html:'Modo download ativado!'});
    }else{
        $("#sinopse nav .downplay").attr("value",true)
        $("#sinopse nav .downplay i").text("play_arrow")
        M.toast({html:'Modo assistir ativado!'});
    }
}

//Carregar capitulos da fonte selecionada
async function FontCaps(index){
    let cap = 1;
    loading(true);
    if((aux.AniMan.Capitulos).length>0){
        cap = aux.AniMan.Capitulos[(aux.AniMan.Capitulos).length-1]['Episodio'];
    }
    aux.FontMangaindex = index;
    WebApp.Ajax(await Make_Url_Manga(index,aux.AniMan.Nome,cap),''+async function(Code,Result){
        if(Code==200){
            Result = htmlDecode(Result);
            Result = Result.split("viewerChapter chapters")[1];
            Result = Result.split(" - #");
            $("#epcap .cap").html(" ");
            for(let cont=1,temp;cont<Result.length;cont++){
                temp = (Result[cont]).split('</')[0];
                $("#epcap .cap").html(`<option value="${temp}">${temp}</option>${$("#epcap .cap").html()}`);
            }
        }
        $("#list_epcap").show();
        loading(false);
    });
}

//Troca de sistema de Animes/Manga
async function swap(Type){
    $('#anime_manga_lac .page-content').html('');
    aux.Type = Type;
    await sleep(300);
    $('.swap').text(Type);
    if((aux.inicial[Type]).length<=0){
        aux.Fonts[Type][aux.AniManSource[Type]].Lancamentos();
        return false;
    }else{
        let temp = aux.inicial[Type];
        console.log(aux.FavCheck);
        for(let cont=0,css='';cont<temp.length;cont++){
            if((aux.FavCheck).includes(`${temp[cont].nome}-${Type}`)){
                css = "isFav";
            }else{
                css = "";
            }
            $('#anime_manga_lac .page-content').append(`
                <li class="col s4 m3 l2 AniMan_Sinopse" value="${temp[cont].link}">
                    <div class="card-image">
                        <img src="${temp[cont].img}" class="${css}">
                        <span class="titulo">${temp[cont].nome}</span>
                        <span class="stat light-blue darken-2">${temp[cont].ep}</span>
                    </div>
                </li>
            `);
        }
        $("#anime_manga_lac .page-content li").unbind();
        $("#anime_manga_lac .page-content li").on( "click", function() {
            aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Lancamentos_Action($(this).attr('value'));
        });
        cover_height();
    }
    return true;
}

/*
    ajax = Requisitar dados de uma url. (url)
    apk_version = Versão do APK. (null)
    save_file = Salva arquivo. (/diretorio/nome.png,LINK)
    exit = Fecha app. (null)
    arquivo_devar = Deleta um arquivo. (Diretorio/arquivos.png)
    arquivo_liste = Retorna lista de todos arquivos, (extensão (*),diretorio)
    dir_liste = Listar aquivos. (Diretorio)
    dir_exist = Exist diretorio,Diretorio
    dir_creat = Cria diretorio,Diretorio
    dir_devar = Deletar pasta,Diretorio
    status_bar = FullScreenn,null
    open_link = Abre um link,url
    save_file_manga = Salva arquivo. (/diretorio/nome.png,LINK)
    download = adiciona download ao status bar,(/xx/xx/nome.png,link)
    ads = mostra anuncio, (interstial,offerwall,rewarded,specialoffer)
    analytics = info, (inicio,sinopse,animexx)
*/


//Somente android pode chamar essa função
function android_set(Dado){
    aux.call_result = Dado;
}

//Calcular porcentagem
async function porcentagem(partialValue, totalValue) {
    return ((100 * partialValue) / totalValue ) | 0;
}

//Modal de progresso
async function progress(Procent){
    $('#progress .determinate').width(Procent+'%');
    if(Procent<100){
        if(!$('#progress').hasClass('open')){
            $('#progress').modal('open');
        }
    }else{
        if($('#progress').hasClass('open')){
            $('#progress').modal('close');
        }
    }
}

function photoswip_open(){
    let items = new Array();
    for(let cont=0;cont<(aux.MangasSources).length;cont++){
        items.push(
            {
                src: aux.MangasSources[cont],
                w: 0,
                h: 0
            }
        );
    }
    let pswpElement = document.querySelectorAll('.pswp')[0];
    let options = {       
        history: false,
        focus: false,
        showAnimationDuration: 0,
        hideAnimationDuration: 0    
    };
        
    aux.PhotoSwipe_gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
    aux.PhotoSwipe_gallery.listen('gettingData', function(index, item) {
        if (item.w < 1 || item.h < 1) { // unknown size
            var img = new Image(); 
            img.onload = function() { // will get size after load
                item.w = this.width; // set image width
                item.h = this.height; // set image height
                aux.PhotoSwipe_gallery.invalidateCurrItems(); // reinit Items
                aux.PhotoSwipe_gallery.updateSize(true); // reinit Items
            }
            img.src = item.src; // let's download image
        }
    });
    aux.PhotoSwipe_gallery.init();
    aux.PhotoSwipe_gallery.options.closeOnVerticalDrag = false;
    aux.PhotoSwipe_gallery.options.pinchToClose = false;
}

//Dormi
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Decodifica para UTF8
function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function HtmlToVideo(html){
    let Video =[
        ['bg.mp4',true],
        ['?contentId=',true],
        ['video.g?token=',true],
        ['videoplayback',false],
        ['.mp4',false],
        ['.MP4',false]
    ];
    let pilha_src= new Array(),
        pilha_src_final = new Array(),
        temp,
        parametro,
        temp2,
        check=true,j,k;
    html = html.split('http');
    for(j=1;j<html.length;j++){
        temp = (html[j]).split("'")[0];
        temp = (temp).split('"')[0];
        temp = 'http'+temp;
        pilha_src.push(temp);
    }

    //Pesquisar quais são as fontes de video
    for(j=0;j<pilha_src.length;j++){
        for(k=0;k<Video.length;k++){
            if((pilha_src[j]).includes(Video[k][0])){
                pilha_src_final.push([pilha_src[j],Video[k][1]]);
                break;
            }
        }
    }
    
    console.log("Videos:");
    console.log(pilha_src_final);
    return pilha_src_final;
}

//Transforma texto em dados
//One Piece,OVA,5
function tratamento(txt,biblioteca){
    var EpTratamento = [' ', ':','-'] 
        ,nome
        ,ep
        ,tipo;
    for(var j=0; j<biblioteca.length;j++){
        for(var i=0; i<(biblioteca[j].par).length;i++){
            if(txt.includes(biblioteca[j].par[i])){
                tipo = biblioteca[j].tipo;
                nome = txt.split(biblioteca[j].par[i])[0];
                ep = txt.split(biblioteca[j].par[i])[1];
                ep = ep.trim();
                for(var k=0;k<EpTratamento.length;k++){
                    ep = ep.split(EpTratamento[k])[0];
                }
                ep = parseInt(ep);
                nome = nome.trim();
                return [nome,ep,tipo];
            }
        }
    }
    return null;
}




function load_fonts_Mangas(){
    aux.Fonts['Manga'] = [
        {
            Nome:'MangaHost',
            Link:'https://mangahosted.com/manga/#nome#/#cap#',
            Idioma:'PT-Br',
            Lancamentos:function(){
                loading(true);
                WebApp.Ajax('https://mangahosted.com',''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('.block-lancamentos').each(function( index ){
                        (aux.inicial['Manga']).push({
                            'img':$(this).find('img').attr('src'),
                            'nome':$(this).find('img').attr("alt"),
                            'ep':$(this).find(".btn-caps").first().text(),
                            'link':$(this).find(".image-lancamento").attr("href")
                        });
                    });
                    //sleep(1000);
                    swap("Manga");
                    loading(false);
                });
            },
            Lancamentos_Action:function(Link){
                aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Sinopse(Link);
            },
            Pesquisa:function(Index){
                if($("#nome_pesquisa").val()==""){
                    loading(true);
                    WebApp.Ajax('https://mangahosted.com/mangas/page/'+Index,''+async function(Code,Result){
                        Result = $($.parseHTML(htmlDecode(Result)));
                        Result.find('.manga-block-img').each(function( index ){
                            $('#pesquisa ul').append(`
                                <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).attr('href')}">
                                    <div class="card-image">
                                        <img src="${$(this).find('img').attr('src')}"/>
                                        <span class="titulo">${$(this).attr('title')}</span>
                                    </div>
                                </li>
                            `);
                        });
                        cover_height();
                        loading(false); 
                    });
                }else{
                    console.log('Pesquisa nome...');
                    if(Index==1){
                        loading(true);
                        WebApp.Ajax('https://mangahosted.com/find/'+encodeURI($("#nome_pesquisa").val()),''+async function(Code,Result){
                            Result = $($.parseHTML(htmlDecode(Result)));
                            Result.find('tr').each(function( index ){
                                $('#pesquisa ul').append(`
                                    <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).find('.entry-title a').attr('href')}">
                                        <div class="card-image">
                                            <img src="${($(this).find('img').attr('src')+"").split("small.").join("xmedium.")}"/>
                                            <span class="titulo">${$(this).find('.entry-title a').text()}</span>
                                        </div>
                                    </li>
                                `);
                            });
                            cover_height();
                            loading(false);
                        });
                    }else{
                        M.toast({html:'Fim...'});
                    }
                }
            },
            Generos:function(Index){
                WebApp.Ajax('https://mangahosted.com/mangas/'+(aux.AniManGenero).toLowerCase()+'/page/'+Index,''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('.manga-block-img').each(function( index ){
                        $('#genero ul').append(`
                            <li class="col s4 m3 l2" value="${$(this).attr('href')}">
                                <div class="card-image">
                                    <img src="${$(this).find('img').attr('src')}"/>
                                    <span class="titulo">${$(this).attr('title')}</span>
                                </div>
                            </li>
                        `);
                        });
                    cover_height();
                    loading(false); 
                });
            },
            Sinopse:function(Link){
                loading(true);
                aux.AniMan = new Object();
                aux.AniMan['Link'] = Link;
                console.log(Link);
                WebApp.Ajax(Link,''+function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan['Type'] = "Manga";
                    aux.AniMan['Nome'] = Result.find(".title").text();
                    aux.AniMan['Generos'] = new Array();
                    aux.AniMan['inf'] = "";
                    aux.AniMan['Capitulos'] = new Array();
                    aux.AniMan['Episodios'] = new Array();
                    aux.AniMan['Img'] = Result.find(".widget img").attr("src");
                    aux.AniMan['Descricao'] = Result.find(".paragraph").text();

                    //Descrição
                    Result.find(".w-list-unstyled li div").each(function( index ){
                        if(($(this).html()+"").includes("Status") || ($(this).html()+"").includes("Autor") || ($(this).html()+"").includes("Arte") || ($(this).html()+"").includes("Ano") || ($(this).html()+"").includes("Leitura")){
                            aux.AniMan['inf'] += "<p>"+$(this).html()+"</p>";
                        }
                    });

                    //Generos
                    Result.find(".article .tags").first().find(".tag").each(function( index ){
                        (aux.AniMan['Generos']).push($(this).text());
                    });

                    //Capitulos
                    WebApp.Ajax(aux.AniMan['Link']+"/"+Result.find(".chapters .card .btn-caps").first().text(),''+function(Code,Result){
                        Result = $($.parseHTML(htmlDecode(Result)));
                        Result.find(".navi .viewerChapter").first().find("option").each(function( index ){
                            (aux.AniMan['Capitulos']).push({
                                'Cap':$(this).attr("value"),
                                'Link':aux.AniMan['Link']+"/"+$(this).attr("value")
                            });
                        })
                        sinopse();
                        loading(false);
                    })
                });
            },
            Sources:function(Link){
                loading(true);
                WebApp.Ajax(Link,''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    let sources = new Array();
                    sources = Result.find("#slider img").map(function(){
                        return $(this).attr("src");
                    })
                    loading(false);
                    Ler_Baixar_Mangas(sources);
                });
            }
        },
        {
            Nome:'UnionLeitor',
            Link:'https://unionmangas.top/',
            Idioma:'PT-Br',
            Lancamentos:function(){
                loading(true);
                WebApp.Ajax('https://unionmangas.top/inicial',''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find(".row").each(function(index){
                        if(!($(this).html()+"").includes("text-center") && (($(this).html()+"").includes("/leitor/") || ($(this).html()+"").includes("/assets/uploads/"))){
                            if(($(this).html()+"").includes(`"link-titulo">`)){
                                let Nome = ($(this).html()+"").split(`"link-titulo">`)[2];
                                Nome = Nome.split("</a>")[0];
                                Nome = Nome.trim();
                                let Img = ($(this).html()+"").split(`src="`)[1];
                                Img = Img.split(`"`)[0];
                                let Link = ($(this).html()+"").split(`href="`)[1];
                                Link = Link.split(`"`)[0];
                                (aux.inicial['Manga']).push({
                                    'img':Img,
                                    'nome':Nome,
                                    'ep':null,
                                    'link':Link
                                });
                            }else if(($(this).html()+"").includes(`/leitor/`)){
                                let cap = $(this).find('a').first().text();
                                if(cap.includes("tulo ")){
                                    cap = cap.split("tulo ")[1];
                                }
                                aux.inicial['Manga'][(aux.inicial['Manga']).length-1].ep = cap;
                            }
                        }
                    })
                    //sleep(1000);
                    swap("Manga");
                    loading(false);
                });
            },
            Lancamentos_Action:function(Link){
                aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Sinopse(Link);
            },
            Pesquisa:function(Index){
                if($("#nome_pesquisa").val()==""){
                    loading(true);
                    WebApp.Ajax('https://unionmangas.top/lista-mangas/a-z/'+Index+'/*',''+async function(Code,Result){
                        Result = $($.parseHTML(htmlDecode(Result)));
                        Result.find('.bloco-manga').each(function( index ){
                            $('#pesquisa ul').append(`
                                <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).find('a').first().attr('href')}">
                                    <div class="card-image">
                                        <img src="${$(this).find('img').attr('src')}"/>
                                        <span class="titulo">${$(this).find('a').next().text()}</span>
                                    </div>
                                </li>
                            `);
                        });
                        cover_height();
                        loading(false); 
                    });
                }else{
                    M.toast({html:`Ainda não e possivel pesquisar nomes nessa fonte...`});
                    loading(false); 
                }
            },
            Generos:function(Index){
                WebApp.Ajax('https://unionmangas.top/lista-mangas/'+(aux.AniManGenero).toLowerCase()+'/'+Index,''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('.bloco-manga').each(function( index ){
                        $('#genero ul').append(`
                            <li class="col s4 m3 l2" value="${$(this).find('a').first().attr('href')}">
                                    <div class="card-image">
                                <img src="${$(this).find('img').attr('src')}"/>
                                    <span class="titulo">${$(this).find('a').next().text()}</span>
                                </div>
                            </li>
                        `);
                    });
                    cover_height();
                    loading(false); 
                });
            },
            Sinopse:function(Link){
                loading(true);
                aux.AniMan = new Object();
                aux.AniMan['Link'] = Link;
                console.log(Link);
                WebApp.Ajax(Link,''+function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan['Type'] = "Manga";
                    aux.AniMan['Nome'] = Result.find(".col-md-12 h2").first().text();
                    aux.AniMan['Generos'] = new Array();
                    aux.AniMan['inf'] = "";
                    aux.AniMan['Capitulos'] = new Array();
                    aux.AniMan['Episodios'] = new Array();

                    aux.AniMan['Img'] = Result.find('.img-thumbnail').attr("src");
                    aux.AniMan['Descricao'] = Result.find('.panel-body').text();
                    Result.find('.manga-perfil').each(function( index ){
                        if(($(this).text()).includes("Gênero")){
                            aux.AniMan['Generos'] = ($(this).text()).split("o(s): ")[1];
                            aux.AniMan['Generos'] = (aux.AniMan['Generos']).split(",");
                        }else{
                            aux.AniMan['inf'] += "<p>"+$(this).text()+"</p>";
                        }
                    });
                    console.log(aux.AniMan);
                    Result.find('.lancamento-linha .col-md-6 a').each(function( index ){
                        if(($(this).attr("href")).includes("/leitor/")){
                            (aux.AniMan['Capitulos']).push({
                                'Cap':($(this).text()).split(" ")[1],
                                'Link':$(this).attr("href")
                            });
                        }
                    });
                    sinopse();
                    loading(false);
                });
            },
            Sources:function(Link){
                loading(true);
                WebApp.Ajax(Link,''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    let sources = new Array();
                    Result.find('.img-manga').each(function( index ){
                        sources.push($(this).attr("src"));
                    });
                    loading(false);
                    Ler_Baixar_Mangas(sources);
                });
            }
        },
        {
            Nome:'MangaKakalot',
            Link:'https://mangakakalot.com',
            Idioma:'En-US',
            Lancamentos:function(){
                loading(true);
                WebApp.Ajax('https://mangakakalot.com',''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('.content-homepage-item').each(function( index ){
                        let ep = $(this).find(".item-chapter a").first().text();
                        if(ep.includes(":")){
                            ep = ep.split(":")[0];
                            ep = ep.split(" ")[(ep.split(" ")).length-1];
                        }else{
                            ep = ep.split(" ")[(ep.split(" ")).length-1];
                        }
                        (aux.inicial['Manga']).push({
                            'img':$(this).find('img').attr('src'),
                            'nome':$(this).find(".item-img").attr("title"),
                            'ep':ep,
                            'link':$(this).find(".item-img").attr("href")
                        });
                    });
                    //sleep(1000);
                    swap("Manga");
                    loading(false);
                });
            },
            Lancamentos_Action:function(Link){
                aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Sinopse(Link);
            },
            Pesquisa:function(Index){
                if($("#nome_pesquisa").val()==""){
                    loading(true);
                    WebApp.Ajax('https://mangakakalot.com/genre-all/'+Index,''+async function(Code,Result){
                        Result = $($.parseHTML(htmlDecode(Result)));
                        Result.find('.content-genres-item').each(function( index ){
                            $('#pesquisa ul').append(`
                                <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).find('h3 a').first().attr('href')}">
                                    <div class="card-image">
                                        <img src="${$(this).find('a img').attr('src')}"/>
                                        <span class="titulo">${$(this).find('h3 a').first().text()}</span>
                                    </div>
                                </li>
                            `);
                        });
                        cover_height();
                        loading(false); 
                    });
                }else{
                    loading(true);
                    WebApp.Ajax('https://mangakakalot.com/search/story/'+($("#nome_pesquisa").val()+"").toLowerCase().split(" ").join("_")+'?page='+Index,''+async function(Code,Result){
                        Result = $($.parseHTML(htmlDecode(Result)));
                        Result.find('.search-story-item').each(function( index ){
                            $('#pesquisa ul').append(`
                                <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).find('h3 a').first().attr('href')}">
                                    <div class="card-image">
                                        <img src="${$(this).find('a img').attr('src')}"/>
                                        <span class="titulo">${$(this).find('h3 a').first().text()}</span>
                                    </div>
                                </li>
                            `);
                        });
                        cover_height();
                        loading(false);
                    });
                }
            },
            Generos:function(Index){
                M.toast({html:`Not working!`});
                loading(false); 
            },
            Sinopse:function(Link){
                loading(true);
                aux.AniMan = new Object();
                aux.AniMan['Link'] = Link;
                console.log(Link);
                WebApp.Ajax(Link,''+function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan['Type'] = "Manga";
                    aux.AniMan['Nome'] = Result.find(".story-info-right h1").first().text();
                    aux.AniMan['Generos'] = new Array();
                    aux.AniMan['inf'] = "";
                    aux.AniMan['Capitulos'] = new Array();
                    aux.AniMan['Episodios'] = new Array();
                    aux.AniMan['Img'] = Result.find(".info-image img").attr("src");
                    aux.AniMan['Descricao'] = Result.find("#panel-story-info-description").text();

                    //Descrição
                    Result.find(".variations-tableInfo tr").each(function( index ){
                        if(($(this).html()+"").includes("Status") || ($(this).html()+"").includes("updated") || ($(this).html()+"").includes("Genres")){
                            if(($(this).html()+"").includes("Genres")){
                                $(this).find("a").each(function( index ){
                                    (aux.AniMan['Generos']).push($(this).text());
                                });
                            }else{
                                aux.AniMan['inf'] += "<p>"+$(this).text()+"</p>";
                            }
                        }
                    });

                    //Capitulos
                    Result.find(".row-content-chapter > li  a").each(function( index ){
                        (aux.AniMan['Capitulos']).push({
                            'Cap':$(this).text(),
                            'Link':$(this).attr("href")
                        });
                    });

                    sinopse();
                    loading(false);
                });
            },
            Sources:function(Link){
                loading(true);
                console.log(Link);
                WebApp.Ajax(Link,''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    loading(false);
                    aux.MangasSources = new Array();
                    await Result.find("img").each(function(index){
                        if(($(this).attr("title")+"").includes("MangaNelo.com")){
                            (aux.MangasSources).push($(this).attr("src"));
                            console.log($(this).attr("src"));
                        }
                    });
                    Ler_Baixar_Mangas(aux.MangasSources);
                });
            }
        }
    ];
}




function load_fonts_Animes(){
    aux.BibliotecaIdioma['PT-Br'] = [
        {
            'par':[' - Episodio ',' - Episódio ',' – Episódio – ',' – Episódio ',' – Episodio ',' Episódio – ',' Episódio - ',' Episódio ',' Episodio '],
            'tipo':'EP'
        },
        {
            'par':[' – OVA ',' – Ova ',' - ova ',' OVA ',' Ova ',' ova '],
            'tipo':'OVA'
        },
        {
            'par':[' – Parte ',' – Part ',' – Filme ',' - Filme '],
            'tipo':'Filme '
        }
    ];
    aux.BibliotecaIdioma['En-US'] = [
        {
            'par':[' - Episode ',' - Episode ',' – Episode – ',' – Episode ',' – Episode ',' Episode – ',' Episode - ',' Episode ',' Episode '],
            'tipo':'EP'
        },
        {
            'par':[' – OVA ',' – Ova ',' - ova ',' OVA ',' Ova ',' ova '],
            'tipo':'OVA'
        },
        {
            'par':[' – Parte ',' – Part ',' – Filme ',' - Filme '],
            'tipo':'Movie '
        }
    ];

    aux.Fonts['Anime'] = [
        {
            Nome:'Anitube',
            Link:'https://www.anitube.site',
            Idioma:'PT-Br',
            Lancamentos:function(){
                loading(true);
                WebApp.Ajax('https://www.anitube.site',''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('.epiSubContainer .epiItem').each(function( index ){
                        let temp = tratamento($(this).find('a').attr('title'),aux.BibliotecaIdioma['PT-Br']);
                        if(temp==null){
                            return null;
                        }
                        (aux.inicial['Anime']).push({
                            'img':$(this).find('img').attr('src'),
                            'nome':temp[0],
                            'ep':temp[2]+''+temp[1],
                            'link': $(this).find('a').attr('href')
                        });
                    });
                    //sleep(1000);
                    await swap("Anime");
                    loading(false);
                });
            },
            Lancamentos_Action:function(Link){
                loading(true);
                WebApp.Ajax(Link,''+async function(Code,Result){
                    console.log("Sobrescreveu!");
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan = new Object();
                    aux.AniMan['Link'] = $(Result).find('.listaPagAni').attr('href');
                    console.log(aux.AniMan['Link']);
                    aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Sinopse(aux.AniMan['Link']);
                    loading(false);
                });
            }
            ,
            Pesquisa:function(Index){
                loading(true);
                let link_gostoso = "";
                if($("#nome_pesquisa").val()==""){
                    link_gostoso = 'https://www.anitube.site/lista-de-animes-online/page/'+Index;
                }else{
                    link_gostoso = 'https://www.anitube.site/page/'+Index+'/?s='+($("#nome_pesquisa").val()).split(" ").join("+");
                }
                console.log(link_gostoso);
                WebApp.Ajax(link_gostoso,''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('.aniItem').each(function( index ){
                        $('#pesquisa ul').append(`
                            <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).find('a').attr('href')}">
                                <div class="card-image">
                                    <img src="${$(this).find('img').attr('src')}"/>
                                    <span class="titulo">${$(this).find('img').attr('title').split(" – Todos ")[0]}</span>
                                </div>
                            </li>
                        `);
                    });
                    cover_height();
                    loading(false);
                });
            },
            Generos:function(Index){
                M.toast({html:`Esa fonte se encontra em manutenção...`});
                loading(false); 
            },
            Sinopse:function(Link){
                aux.AniMan = new Object();
                aux.AniMan['Link'] = Link;
                loading(true);
                WebApp.Ajax(Link,''+function(Code,Result){
                    console.log("Boa");
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan['Type'] = "Anime";
                    aux.AniMan['Nome'] = (Result.find('.mwidth h1').text()).split(" – Todos ")[0];
                    aux.AniMan['Generos'] = new Array();
                    aux.AniMan['inf'] = "";
                    aux.AniMan['Capitulos'] = new Array();
                    aux.AniMan['Episodios'] = new Array();

                    aux.AniMan['Img'] = Result.find('#capaAnime img').attr("src");
                    aux.AniMan['Descricao'] = Result.find('#sinopse2').text();
                    Result.find('.boxAnimeSobre .boxAnimeSobreLinha').each(function( index ){
                        if(($(this).text()).includes("Gênero:")){
                            aux.AniMan['Generos'] = ($(this).text()).replace("Gênero:","");
                            aux.AniMan['Generos'] = (aux.AniMan['Generos']).split(",");
                        }else if(!($(this).text()).includes("Anime Para") && !($(this).text()).includes("Episo") && !($(this).text()).includes("Ovas") && !($(this).text()).includes("Filme") && !($(this).text()).includes("Formato")){
                            aux.AniMan['inf'] += "<p>"+$(this).html()+"</p>";
                        }
                    });
                    console.log(aux.AniMan);
                    Result.find('.pagAniListaContainer a').each(function( index ){
                        let temp = tratamento($(this).attr("title"),aux.BibliotecaIdioma['PT-Br']);
                        if(temp===null){
                            return null;
                        }
                        (aux.AniMan['Episodios']).push({
                            'Ep':temp[2]+''+temp[1],
                            'Link':$(this).attr("href")
                        });
                    });
                    sinopse();
                    loading(false);
                });
            }
        },
        {
            Nome:'4anime',
            Link:'https://4anime.to',
            Idioma:'En-US',
            Lancamentos:function(){
                loading(true);
                //Pagina 1
                WebApp.Ajax('https://4anime.to/recently-added',''+async function(Code,Result){
                    Result = htmlDecode(Result);
                    Result = Result.split(`id=`).join("class=");
                    Result = $($.parseHTML(Result));
                    Result.find('.headerA_5').each(function(index){
                        let temp = tratamento($(this).find('img').attr('title'),aux.BibliotecaIdioma['En-US']);
                        if(temp==null){
                            return null;
                        }
                        (aux.inicial['Anime']).push({
                            'img':$(this).find('img').attr('src'),
                            'nome':temp[0],
                            'ep':temp[2]+''+temp[1],
                            'link': $(this).attr('href')
                        });
                    });
                    WebApp.Ajax('https://4anime.to/recently-added/page/3',''+async function(Code,Result){
                        Result = htmlDecode(Result);
                        Result = Result.split(`id=`).join("class=");
                        Result = $($.parseHTML(Result));
                        Result.find('.headerA_5').each(function(index){
                            let temp = tratamento($(this).find('img').attr('title'),aux.BibliotecaIdioma['En-US']);
                            if(temp==null){
                                return null;
                            }
                            (aux.inicial['Anime']).push({
                                'img':$(this).find('img').attr('src'),
                                'nome':temp[0],
                                'ep':temp[2]+''+temp[1],
                                'link': $(this).attr('href')
                            });
                        });
                        //sleep(1000);
                        await swap("Anime");
                        loading(false);
                    });
                });
            },
            Lancamentos_Action:function(Link){
                loading(true);
                console.log(Link);
                WebApp.Ajax(Link,''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan = new Object();
                    aux.AniMan['Link'] = $(Result).find('.singletitletop a').attr('href');
                    aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Sinopse(aux.AniMan['Link']);
                    loading(false);
                });
            }
            ,
            Pesquisa:function(Index){
                let link_gostoso = "";
                if($("#nome_pesquisa").val()==""){
                    loading(true);
                    link_gostoso = 'https://4anime.to/browse?sort_order=title+asc&sf_paged='+Index;
                    WebApp.Ajax(link_gostoso,''+async function(Code,Result){
                        Result = htmlDecode(Result);
                        Result = Result.split(`id=`).join("class=");
                        Result = $($.parseHTML(Result));
                        Result.find('.headerA_5').each(function( index ){
                            $('#pesquisa ul').append(`
                                <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).attr('href')}">
                                    <div class="card-image">
                                        <img src="https://4anime.to${$(this).find('img').attr('src')}"/>
                                        <span class="titulo">${$(this).find('img').attr('alt')}</span>
                                    </div>
                                </li>
                            `);
                        });
                        cover_height();
                        loading(false);
                    });
                }else{
                    if(Index>1){
                        return false;
                    }
                    loading(true);
                    link_gostoso = 'https://4anime.to/?s='+($("#nome_pesquisa").val()).split(" ").join("+");
                    WebApp.Ajax(link_gostoso,''+async function(Code,Result){
                        Result = htmlDecode(Result);
                        Result = Result.split(`id=`).join("class=");
                        Result = $($.parseHTML(Result));
                        Result.find('.headerDIV_95 a').each(function( index ){
                            $('#pesquisa ul').append(`
                                <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).attr('href')}">
                                    <div class="card-image">
                                        <img src="${$(this).find('img').attr('src')}"/>
                                        <span class="titulo">${$(this).find('div').text()}</span>
                                    </div>
                                </li>
                            `);
                        });
                        cover_height();
                        loading(false);
                    });
                }
            },
            Generos:function(Index){
                link_gostoso = 'https://4anime.to/genre/'+(aux.AniManGenero).toLowerCase()+'/page/'+Index;
                WebApp.Ajax(link_gostoso,''+async function(Code,Result){
                    Result = htmlDecode(Result);
                    Result = Result.split(`id=`).join("class=");
                    Result = $($.parseHTML(Result));
                    Result.find('.headerA_5').each(function( index ){
                        $('#genero ul').append(`
                            <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).attr('href')}">
                                <div class="card-image">
                                    <img src="${$(this).find('img').attr('src')}"/>
                                    <span class="titulo">${$(this).find('img').attr('alt')}</span>
                                </div>
                            </li>
                            `);
                    });
                    cover_height();
                    loading(false);
                });
            },
            Sinopse:function(Link){
                aux.AniMan = new Object();
                aux.AniMan['Link'] = Link;
                loading(true);
                WebApp.Ajax(Link,''+function(Code,Result){
                    console.log("Boa");
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan['Type'] = "Anime";
                    aux.AniMan['Nome'] = Result.find('.single-anime-desktop').text();
                    aux.AniMan['Generos'] = new Array();
                    aux.AniMan['inf'] = "";
                    aux.AniMan['Capitulos'] = new Array();
                    aux.AniMan['Episodios'] = new Array();

                    aux.AniMan['Img'] = "https://4anime.to"+Result.find('.cover img').attr("src");
                    aux.AniMan['Descricao'] = Result.find('.synopsis p').next().text();
                    //Informações
                    Result.find('.detail').each(function( index ){
                        aux.AniMan['inf'] += "<p>"+$(this).find("div").text()+": "+$(this).find("a").text()+"</p>";
                    });
                    //Generos
                    Result.find('.tags-mobile a').each(function( index ){
                        (aux.AniMan['Generos']).push($(this).text());
                    });
                    console.log(aux.AniMan);
                    Result.find('.episodes li a').each(function( index ){
                        (aux.AniMan['Episodios']).push({
                            'Ep':'EP'+$(this).text(),
                            'Link':$(this).attr("href")
                        });
                    });
                    sinopse();
                    loading(false);
                });
            }
        },
        {
            Nome:'AnimesOnline',
            Link:'https://animesonline.cc/tv/',
            Idioma:'PT-Br',
            Lancamentos:function(){
                loading(true);
                WebApp.Ajax('https://animesonline.cc/tv/',''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('article').each(function( index ){
                        if($(this).find('.poster img').attr('alt')===undefined){
                            return null;
                        }
                        let temp = tratamento($(this).find('.poster img').attr('alt'),aux.BibliotecaIdioma['PT-Br']);
                        if(temp==null){
                            return null;
                        }
                        let link = $(this).find('.poster a').attr('href');
                        if(!link.includes("http")){
                            link = "https://animesonline.cc"+ link;
                        }
                        (aux.inicial['Anime']).push({
                            'img':$(this).find('.poster img').attr('src'),
                            'nome':temp[0],
                            'ep':temp[2]+''+temp[1],
                            'link': link
                        });
                    });
                    //sleep(1000);
                    await swap("Anime");
                    loading(false);
                });
            },
            Lancamentos_Action:function(Link){
                loading(true);
                console.log(Link);
                WebApp.Ajax(Link,''+async function(Code,Result){
                    console.log("Sobrescreveu!");
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan = new Object();
                    aux.AniMan['Link'] = $(Result).find('.areaserie a').attr('href');
                    aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Sinopse(aux.AniMan['Link']);
                    loading(false);
                });
            },
            Pesquisa:function(Index){
                loading(true);
                let link_gostoso = "";
                if($("#nome_pesquisa").val()==""){
                    link_gostoso = 'https://animesonline.cc/genero/legendado/page/'+Index;
                }else{
                    link_gostoso = 'https://animesonline.cc/search/'+($("#nome_pesquisa").val()).split(" ").join("+")+'/page/'+Index+'/';
                }
                console.log(link_gostoso);
                WebApp.Ajax(link_gostoso,''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('article').each(function( index ){
                        $('#pesquisa ul').append(`
                            <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).find('.poster a').attr('href')}">
                                <div class="card-image">
                                    <img src="${$(this).find('img').attr('src')}"/>
                                    <span class="titulo">${$(this).find('img').attr('alt')}</span>
                                </div>
                            </li>
                        `);
                    });
                    cover_height();
                    loading(false);
                });
            },
            Generos:function(Index){
                WebApp.Ajax('https://animesonline.cc/genero/'+(aux.AniManGenero).toLowerCase()+'/page/'+Index+'/',''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('article').each(function( index ){
                        $('#genero ul').append(`
                            <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).find('.poster a').attr('href')}">
                                <div class="card-image">
                                    <img src="${$(this).find('img').attr('src')}"/>
                                    <span class="titulo">${$(this).find('img').attr('alt')}</span>
                                </div>
                            </li>
                        `);
                    });
                    cover_height();
                    loading(false);
                });
            },
            Sinopse:function(Link){
                aux.AniMan = new Object();
                aux.AniMan['Link'] = Link;
                loading(true);
                console.log(Link);
                WebApp.Ajax(Link,''+function(Code,Result){
                    console.log("Boa");
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan['Type'] = "Anime";
                    aux.AniMan['Nome'] = Result.find('.data h1').text();
                    aux.AniMan['Nome'] = (aux.AniMan['Nome']).split(" Todos")[0];
                    aux.AniMan['Generos'] = new Array();
                    aux.AniMan['inf'] = "";
                    aux.AniMan['Capitulos'] = new Array();
                    aux.AniMan['Episodios'] = new Array();

                    aux.AniMan['Img'] = Result.find('.poster img').attr("src");
                    aux.AniMan['Descricao'] = Result.find('.wp-content p').text();
                    Result.find('.sgeneros a').each(function( index ){
                        (aux.AniMan['Generos']).push($(this).text());
                    });
                    console.log(aux.AniMan);
                    Result.find('.se-c').each(async function( index ){
                        aux.Temp = $(this).find(".se-q .title").text().replace("emporada","emp.");
                        console.log(aux.Temp);
                        await $(this).find('li').each(async function(index){
                            (aux.AniMan['Episodios']).push({
                                'Ep':aux.Temp+" "+($(this).find(".numerando").html()).split(" - ").join(""),
                                'Link':$(this).find("a").attr("href")
                            });
                        });                        
                    });
                    sinopse();
                    loading(false);
                });
            }
        },
        {
            Nome:'AnimeOnline',
            Link:'https://animeonline.site',
            Idioma:'PT-Br',
            Lancamentos:function(){
                loading(true);
                WebApp.Ajax('https://animeonline.site',''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('.conteudoPost .postEP a').each(function( index ){
                        let temp = tratamento($(this).find('img').attr('alt'),aux.BibliotecaIdioma['PT-Br']);
                        if(temp==null){
                            return null;
                        }
                        (aux.inicial['Anime']).push({
                            'img':$(this).find('img').attr('src'),
                            'nome':temp[0],
                            'ep':temp[2]+''+temp[1],
                            'link': $(this).attr('href')
                        });
                    });
                    WebApp.Ajax('https://animeonline.site/page/2',''+async function(Code,Result){
                        Result = $($.parseHTML(htmlDecode(Result)));
                        Result.find('.conteudoPost .postEP a').each(function( index ){
                            let temp = tratamento($(this).find('img').attr('alt'),aux.BibliotecaIdioma['PT-Br']);
                            if(temp==null){
                                return null;
                            }
                            (aux.inicial['Anime']).push({
                                'img':$(this).find('img').attr('src'),
                                'nome':temp[0],
                                'ep':temp[2]+''+temp[1],
                                'link': $(this).attr('href')
                            });
                        });
                        //sleep(1000);
                        await swap("Anime");
                        loading(false);
                    });
                });
            },
            Lancamentos_Action:function(Link){
                loading(true);
                console.log(Link);
                WebApp.Ajax(Link,''+async function(Code,Result){
                    console.log("Sobrescreveu!");
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan = new Object();
                    Result.find('.breadcrumbList a').each(function( index ){
                        if(($(this).attr("href")).includes("/anime/")){
                            aux.AniMan['Link'] = $(this).attr("href");
                            aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Sinopse(aux.AniMan['Link']);
                            loading(false);
                        }
                    })
                });
            }
            ,
            Pesquisa:function(Index){
                loading(true);
                let link_gostoso = "";
                link_gostoso = 'https://animeonline.site/page/'+Index+'?s='+($("#nome_pesquisa").val()).split(" ").join("+");
                console.log(link_gostoso);
                WebApp.Ajax(link_gostoso,''+async function(Code,Result){
                    Result = $($.parseHTML(htmlDecode(Result)));
                    Result.find('.conteudoPost .postCapa a').each(function( index ){
                        $('#pesquisa ul').append(`
                            <li class="col s4 m3 l2 AniMan_Sinopse" value="${$(this).attr('href')}">
                                <div class="card-image">
                                    <img src="${$(this).find('img').attr('src')}"/>
                                    <span class="titulo">${$(this).find('img').attr('alt')}</span>
                                </div>
                            </li>
                        `);
                    });
                    cover_height();
                    loading(false);
                });
            },
            Generos:function(Index){
                M.toast({html:`Indisponivel nesta fonte!`});
                loading(false);
            },
            Sinopse:function(Link){
                aux.AniMan = new Object();
                aux.AniMan['Link'] = Link;
                loading(true);
                console.log(Link);
                WebApp.Ajax(Link,''+function(Code,Result){
                    console.log("Boa");
                    Result = $($.parseHTML(htmlDecode(Result)));
                    aux.AniMan['Type'] = "Anime";
                    aux.AniMan['Nome'] = Result.find('.breadcrumbList h1').text();
                    aux.AniMan['Nome'] = (aux.AniMan['Nome']).split(" Todos")[0];
                    aux.AniMan['Generos'] = new Array();
                    aux.AniMan['inf'] = "";
                    aux.AniMan['Capitulos'] = new Array();
                    aux.AniMan['Episodios'] = new Array();

                    aux.AniMan['Img'] = Result.find('.capaList img').attr("src");
                    aux.AniMan['Descricao'] = Result.find('.sinopse').text();
                    Result.find('.infoCP span').each(function( index ){
                        if(($(this).text()).includes("Gênero")){
                            aux.AniMan['Generos'] = $(this).text();
                            aux.AniMan['Generos'] = (aux.AniMan['Generos']).split("Gênero:").join("").slice(0, -1).split(",");
                        }else if(($(this).text()).includes("Author") || ($(this).text()).includes("Estudio") || ($(this).text()).includes("Status")){
                            aux.AniMan['inf'] += "<p>"+$(this).html()+"</p>";
                        }
                    });
                    console.log(aux.AniMan);
                    Result.find('.listEP li a').each(async function( index ){
                        let temp = tratamento($(this).text(),aux.BibliotecaIdioma['PT-Br']);
                        if(temp===null){
                            return null;
                        }
                        (aux.AniMan['Episodios']).push({
                            'Ep':`${temp[2]}${temp[1]}`,
                            'Link':$(this).attr("href")
                        });
                    });
                    sinopse();
                    loading(false);
                });
            }
        }
    ];
}
