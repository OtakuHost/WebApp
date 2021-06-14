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
            TFontes:async function(Fontes){
                if((Fontes[0]).includes("/0/bg.mp4")){
                    let temp = Fontes[0];
                    WebApp.UrlRedirect("https://www.anitube.site/?s=One+Piece",Fontes[0],function(url){
                        aux.FontsVids[aux.FontSelect][0] = url;
                        aux.FontsVids[aux.FontSelect][1] = false;
                    });
                    await sleep(500);
                    while(temp==aux.FontsVids[aux.FontSelect][0]){
                        await sleep(500);
                    }
                    return true;
                }
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
            TFontes:async function(Fontes){
                return Fontes;
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
            TFontes:async function(Fontes){
                return Fontes;
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
            TFontes:async function(Fontes){
                return Fontes;
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
