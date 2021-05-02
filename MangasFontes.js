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