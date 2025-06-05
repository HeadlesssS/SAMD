quotekoBatta=document.getElementById("quotes-text");
authorkoBatta=document.getElementById("author-text");
const key="P94eqI+3u9D3ppG+iib0ng==82xqwZrODcYXG0O1";


//category leko
function getCategory(){
    const dropdown=document.getElementById("categories");

    return dropdown.options[dropdown.selectedIndex].value;
}
function getquote(){
    const category = getCategory();
    let url = "https://api.api-ninjas.com/v1/quotes";
    if (category) {
        url += `?category=${category}`;
    }
    const requestOptions = {
        method: 'GET',
        headers: {
            'X-Api-Key': key,
        },
    };
    fetch(url,requestOptions).then(response =>{
        if (!response.ok){
            throw  new Error('Network response is not ok');
        }

        return response.json();
    })
        .then(data => {
            quotekoBatta.textContent = data[0].quote;
            authorkoBatta.textContent = data[0].author;
            console.log(data);
        })
        .catch(error =>{
            console.error("Error:",error)
        });

}




// button haru check
document.getElementById("next-quote").addEventListener("click",function(){
    console.log("naya quote chaiyo rey");
    getquote()
})
document.getElementById("categories").addEventListener("change",function(){
    console.log(getCategory());
    getquote();
})

getquote();