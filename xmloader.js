/**
 * Load XML & XSL data and templates, then process them
 * 
 * @param xmlURL - url to XML document
 * @param xslURL - url to XSL stylesheet
 * @param method - XML HTTP request method (GET/POST)
 * @param data 	- FormData instance applied to XML HTTP request
 * 
 * @author TARiK <tarik@bitstore.ru>
 */
function XMLoader(xmlURL, xslURL, method = "GET", data = NaN) 
{
	 const 
	 	xmlRequest 	= new XMLHttpRequest(),
	 	xslRequest 	= new XMLHttpRequest(),
	 	processor 	= new XSLTProcessor();
	
	 xmlRequest.open(method, xmlURL, true);
	 xslRequest.open("GET", xslURL, true);
	 
	 return Promise.all([new Promise((resolve, reject) => 
	  {		  		  
		  xmlRequest.addEventListener("load", event => resolve(event.target.responseXML));	
		  
		  if (data instanceof FormData)
			  xmlRequest.send(data);
		  else
			  xmlRequest.send();
		  
	  }),new Promise((resolve, reject) => 
	  {
		  xslRequest.addEventListener("load", event => resolve(event.target.responseXML));
		  xslRequest.send();
	  })]).then((result) => 
	  {	
		 processor.importStylesheet(result[1]);
		 return processor.transformToFragment(result[0], document);
	  });	
}
