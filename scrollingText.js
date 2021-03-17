const items = [
    '.tech',
    '.space',
    '.cool',
    '.fun',
    '.website',
    '.cloud',
    '.gg'
];
const text = document.getElementById('switch');
const wrapper = document.getElementById('logo');
const itemsSpan = [];
var progress = 0;
var animation = 0;
const animationMax = 30;

text.innerHTML = "";


for(let i in items)
{
    let span = document.createElement('span');
    span.style.position = "absolute";
    span.style.opacity = 0;
    span.style.top = 0;
    span.innerText = items[i];
    text.appendChild(span);
    itemsSpan.push(span);
}

itemsSpan[itemsSpan.length-1].style.opacity = 1;

setInterval(
    function()
    {
        switchText();
    },
    3000
);

function switchText()
{
    let oldSpan = itemsSpan[(progress == 0) ? itemsSpan.length-1 : progress-1];
    let newSpan = itemsSpan[progress];
    let interval = setInterval(
        function()
        {
            oldSpan.style.opacity = 1 - (animation / animationMax);
            oldSpan.style.top = ((60 * animation) / animationMax) + "px";

            newSpan.style.opacity = animation / animationMax;
            newSpan.style.top = (-60 - ((60 * animation) / animationMax)*-1) + "px";

            if (animation >= animationMax)
            {
                animation = 0;
                clearInterval(interval);
            }
            animation++;
        },
        0
    )

    if(progress < itemsSpan.length-1) progress++;
    else progress = 0;
}