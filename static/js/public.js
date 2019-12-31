function getQueryVariable(variable)
{
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
              var pair = vars[i].split("=");
              if(pair[0] == variable){return pair[1];}
      }
      return(false);
}

function getExtend(x,y,r){
    let currentExtent=[];
    let x0=x+r;
    let y0=y+r;
    let x1=x-r;
    let y1=y-r;
    currentExtent.push([x1, y0]);
    currentExtent.push([x0, y0]);
    currentExtent.push([x0, y1]);
    currentExtent.push([x1, y1]);
    return currentExtent;
}

function getExtendCut(x,y,r){
    let currentExtent=[];
    let x0=x+r;
    let y0=y+r;
    let x1=x-r;
    let y1=y-r;
    currentExtent.push([x1, y0]);
    currentExtent.push([x0, y0]);
    currentExtent.push([x0, y1/2]);
    currentExtent.push([x1, y1/2]);
    return currentExtent;
}