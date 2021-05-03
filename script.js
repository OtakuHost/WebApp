function(){
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
aux.Fonts = new Object();
aux.AniManSource = new Object();
aux.FontsVids = new Object();
aux.inicial = new Object();
aux.inicial['Manga'] = new Array();
aux.inicial['Anime'] = new Array();
aux.BibliotecaIdioma = new Object();
aux.InterstitialTime = 0;
aux.InterstitialHtml = "";
aux.Bandeiras = {
    "PT-Br":"🇧🇷",
    "En-US":"🇱🇷"
};
aux.Generos = {
    "PT-Br":['Aventura','Escolar','Ecchi','Esporte','Comedia','Drama','Fantasia','Harem','Mecha','Shoujo','Seinen','Shounen','Romance','Terror'],
    "En-US":['Adventure', 'School', 'Ecchi', 'Sport', 'Comedy', 'Drama', 'Fantasy', 'Harem', 'Mecha', 'Shoujo', 'Seinen', 'Shounen' , 'Romance ','Horror']
};
aux.Biblioteca = null;
aux.EpTratamento = [' ', ':','-'];
aux.android_sinaleiro = true;
aux.android_callModal = ['ajax'];
aux.android_callIgnore = ['save_file_manga','assistir','open_link','exit','download','ads','analytics','interstitial_show','interstitial_close','inject'];
aux.PaginacaoDetectCheck = false;
aux.DownloadsConfig = new Object();
aux.DownloadsConfig.Farol = true;
aux.DownloadsConfig.Request = false;
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
    WebApp.Ajax('https://raw.githubusercontent.com/otakuhostapp/otakuhost/master/AnimesFontes.js',''+async function(Code,Result){
        console.log("Carregando dados..... Resposta: "+Code);
        eval(Result);
        
    });
    WebApp.Ajax('https://raw.githubusercontent.com/otakuhostapp/otakuhost/master/MangasFontes.js',''+async function(Code,Result){
        console.log("Carregando dados..... Resposta: "+Code);
        eval(Result);
        console.log("Carregando dados..... OK");
    });
    
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
    if(localStorage.getItem("DownloadsFila")!=null){
        aux.DownloadsConfig.Fila = JSON.parse(localStorage.getItem("DownloadsFila"));
    }
    $("#genero").scroll(async function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            await generos_pesquisa(aux.Pag+1);
        }
    });

    $("#genero").on('click', 'input[type="checkbox"]', function() {      
        $('input[type="checkbox"]').not(this).prop('checked', false);      
    });
    $("#pesquisa").scroll(async function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight-1) {
            await pesquisa(aux.Pag+1);
        }
    });
    $.Deferred.exceptionHook = function (err, stackTrace) {
        //$('.modal').modal('close');
    }
    $("#list_MangaSources").html(`<option value="null" selected>Mangá</option>`);
    for(let cont=0;cont<(aux.Fonts['Manga']).length;cont++){
        $("#list_MangaSources").append(`
            <option value="${cont}">${aux.Bandeiras[aux.Fonts['Manga'][cont].Idioma]} ${aux.Fonts['Manga'][cont].Nome}</option>
        `);
    }
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
async function interstitialShow(){
    console.log("Call intensival");
    WebApp.Ads_Intensival();
}
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
    }else{
        let check = await WebApp.DeleteDir(`${aux.Pasta}/mangas/${aux.AniMan}/${$("#biblioteca_caps select").val()}/`);
        biblioteca_caps(aux.AniMan);
    }

}
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
        if(aux.DownloadsConfig.Farol && (aux.DownloadsConfig.Fila).length>0 && aux.DownloadsConfig.Request==false){
            aux.DownloadsConfig.Request = true;
            if(!(aux.Biblioteca).includes(aux.DownloadsConfig.Fila[0].Nome)){
                await WebApp.CreateDir(aux.Pasta+'/mangas/'+aux.DownloadsConfig.Fila[0].Nome);
                await WebApp.SaveFile(`${aux.Pasta}/mangas/${aux.DownloadsConfig.Fila[0].Nome}/capa.jpg`,aux.DownloadsConfig.Fila[0].Img);
                await update_biblioteca();
            }
            for(let cont=0;cont<(aux.DownloadsConfig.Fila[0].Sources).length;cont++){
                if(aux.DownloadsConfig.Fila[0].Sources[cont]!=null){
                    if(cont==0){
                        await WebApp.CreateDir(`${aux.Pasta}/mangas/${aux.DownloadsConfig.Fila[0].Nome}/${aux.DownloadsConfig.Fila[0].Capitulo}`);
                        console.log("Pasta capitlo OK");
                    }
                    WebApp.SaveManga(`${cont}.jpg`,aux.DownloadsConfig.Fila[0].Sources[cont],`${aux.Pasta}/mangas/${aux.DownloadsConfig.Fila[0].Nome}/${aux.DownloadsConfig.Fila[0].Capitulo}/`);
                    aux.DownloadsConfig.Fila[0].Sources[cont] = null;
                    $("#SlideDownload .porcent").first().text(await porcentagem(cont+1,(aux.DownloadsConfig.Fila[0].Sources).length));
                    console.log("Pagº"+cont);
                    return true;
                }
            }
            console.log("Cap OK");
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
async function pesquisa(pag){
    aux.Pag = pag;
    if(pag==1){
        screen('pesquisa');
        $("#pesquisa ul").html("");
    }
    await aux.Fonts[aux.Type][aux.AniManSource[aux.Type]].Pesquisa(aux.Pag);
}
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
async function fontes(){
    aux.FontSelect = null;
    localStorage.setItem('Hist-'+aux.AniMan.Nome+'-'+aux.AniMan.Type, $("#list_epcap").val());
    $("#fontsopc").html("");
    historico($("#list_epcap").val());
    if(aux.AniMan.Type=='Manga'){
        aux.Fonts['Manga'][aux.AniMan['IndexSource']].Sources($("#list_epcap").val());
    }else{
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
async function font_set(index){
    $(`#fontsopc a`).removeClass("deep-orange accent-4");
    $(`#fontsopc a[value='${index}']`).addClass("deep-orange accent-4");
    aux.FontSelect = index;
    if(aux.Type=='Anime'){
        if(aux.FontsVids[index][0]==null){
            alert(2);
            return null;
        }
        if(aux.FontsVids[index][1]){
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
        }
        (aux.Screen).splice((aux.Screen).length-1, 1);
    }else{
        WebApp.Exit();
    }
    $('.modal').modal('close');
    screen(aux.Screen[(aux.Screen).length-1]);
}
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
    if(aux.AniMan.Type=='Manga'){
        aux.Fonts['Manga'][aux.AniMan['IndexSource']].Sources($(CapEp).attr("value"));
    }else{
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
async function sinopse(){
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
    }else{
        $("#epcap .cap").hide();
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
function android_set(Dado){
    aux.call_result = Dado;
}
async function porcentagem(partialValue, totalValue) {
    return ((100 * partialValue) / totalValue ) | 0;
}
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
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
}
