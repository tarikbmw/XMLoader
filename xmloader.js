/**
 * Load XML & XSL data and templates, then process them
 * @param xmlURL target XML document
 * @param xslURL XSL document to process XML
 * @param includeSubTemplates load from xsl:import templates
 * @author TARiK <tarik@bitstore.ru>
 */
function XMLoader(xmlURL, xslURL, includeSubTemplates = false)
{
	 const 
	 	xmlRequest 	= new XMLHttpRequest(),
	 	xslRequest 	= new XMLHttpRequest(),
	 	processor 	= new XSLTProcessor();
	
	 xmlRequest.open("GET", xmlURL, true);
	 xslRequest.open("GET", xslURL, true);
	 
	 return Promise.all([
	 	new Promise((resolve, reject) =>
	  {		  		  
		  xmlRequest.addEventListener("load", event => resolve(event.target.responseXML));	
		  xmlRequest.send();
	  }),
		 new Promise((resolve, reject) =>
	  {
		  xslRequest.addEventListener("load", event => resolve(event.target.responseXML));
		  xslRequest.send();
	  })
	 	]).then((result) =>
	  {	
		 if (!result[0])
			 throw new Error('Could not transform empty XML document.');

		 if (!result[1])
			 throw new Error('XSL stylesheet is empty.');

		// Check for includes and import stylesheet
		 let imported = result[1].querySelectorAll('stylesheet > import');
		 //let included = result[1].querySelectorAll('stylesheet > include');

		if (! imported.length || !includeSubTemplates) {
			processor.importStylesheet(result[1]);
			return processor.transformToFragment(result[0], document);
		}

		return Promise.all( Array.prototype.map.call(imported, ( item =>
		 {
		 	return new Promise(resolve =>
			{
				let req = new XMLHttpRequest();

				req.open('GET', item.getAttribute('href'), true);
				req.send();

				req.addEventListener('load', event =>
				{
					if (!event.target.responseXML)
						throw new Error('Could not load XSL.');

					let tpl = event.target.responseXML.querySelectorAll('template');
					if (tpl.length)
						tpl.forEach(tplItem => item.parentNode.insertBefore(item.ownerDocument.importNode(tplItem, true), item));

					item.parentNode.removeChild(item);

					resolve(true);
				});
			});
		 })) ).then(()=>
		 {
			 processor.importStylesheet(result[1]);
			 const output = processor.transformToFragment(result[0], document);
			 return output;
		 });
	  });
}
