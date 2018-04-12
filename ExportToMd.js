var config = {
	mdPath:"E:/01 Personal Doc/10 Blog/01 hexo-blog/source/_posts/",
	imgPath:"E:/01 Personal Doc/10 Blog/01 hexo-blog/source/images/"
}

function OnExportMDButtonClicked() {
    var objBrowser = WizExplorerApp.Window.CurrentDocumentBrowserObject;
    objBrowser.ExecuteScript("document.body.innerText", function(docText) {
        saveToFile(docText);
    });
}

function saveToFile(docText) {
    var objApp = WizExplorerApp,
        objWindow = objApp.Window,
        objDatabase = objApp.Database,
        objDocument = objWindow.CurrentDocument,
        title = objDocument.Title,
        text = docText,
        docType = objDocument.Type,
        objCommon = objApp.CreateWizObject("WizKMControls.WizCommonUI");


    // if(docType != "markdown"){
    //     objWindow.ShowMessage("不支持非markdown文档导出", "提示", 0x40);
    //     return false;
    // }

    if (!docText) {
        objWindow.ShowMessage("文档内容为空", "提示", 0x40);
        return false;
    }

    text = text.replace(/index_files/g,"/images");

    //reference count dialog
    var dtCreated = new Date(objDocument.DateCreated),
        timeCreated = objCommon.ToLocalDateString(dtCreated, false) + " " + objCommon.ToLocalTimeString(dtCreated);

    //set markdown head info
    var head  = addHead(text, title,objDocument.Tags,timeCreated,objDocument.Parent.Name);
    if (text.indexOf('!---') > -1 && text.lastIndexOf('!---') > 7) {
        text = text.substring(text.lastIndexOf('!---') + 4, text.length);
    }
    text = head + text;

     //save docment as tempory files 文档保存为临时文件（提取图片之用）
    var tempPath = objCommon.GetSpecialFolder("TemporaryFolder");
    tempPath += "export_md_temp/";

    objCommon.CreateDirectory(tempPath);
    tempPath += objDocument.GUID + "/";
    objCommon.CreateDirectory(tempPath);

    var tempImgPath = tempPath + "index_files/",
        tempFile = tempPath + "index.html";

    objCommon.CreateDirectory(tempImgPath);
    objDocument.SaveToHtml(tempFile, 0);

    //save docment as markdown file文件保存为md文件
    var filename = config['mdPath'] + title + ".md";
    objCommon.SaveTextToFile(filename, text, "utf-8");

    //copy file from tempory to target folder 复制图片
    var path = objCommon.EnumFiles2(tempImgPath, "*.*", false);
    if(!path) {
        objWindow.ShowMessage("无图片，导出完成", "提示", 0x40);
        return true;
    }

    var pathArr = path.split("\n"),
        len = pathArr.length,
        curPath = "",
        name = "";

    for (var i = 0; i< len; i++) {
        curPath = pathArr[i];
        name = curPath.substring(curPath.lastIndexOf("/")+1, curPath.length);;
        curPath = config['imgPath'] + name;
        objCommon.CopyFile(pathArr[i], curPath);
    }

    objWindow.ShowMessage("有图片，导出完成", "提示", 0x40);
}

function addHead(text, title, tags, date, categories){
	var ret = [];
	for (var i = 0; i < tags.Count; i++) {
	    ret.push(tags.Item(i).Name);
	}

    tags = ret.join(",");
    
    var moreLabels = '';
    if (text.indexOf('---') > -1 && text.lastIndexOf('---') > 7) {
        moreLabels = text.substring(text.indexOf('!---') + 4, text.lastIndexOf('!---'));
        var encodeLabels = encodeURIComponent(moreLabels);
        encodeLabels = encodeLabels.replace(/%3A%C2%A0/g, '%3A%20')
        moreLabels = decodeURIComponent(encodeLabels);
    }

    moreLabels = moreLabels || '\n';

	var head = "---" + "\n"
			 + "title: " + title + "\n"
	         + "date: " + date + "\n"
             + "categories: " + categories + "\n"
	         + "tags: [" + tags + "]\n"
	         + "comments: " + "true" + "\n"
             + "toc: " + "true"
             + moreLabels
	         + "---" + "\n";

	return head;
}

function InitExoprtToMdButton() {
    var pluginPath = objApp.GetPluginPathByScriptFileName("ExportToMd.js");
    var languangeFileName = pluginPath + "plugin.ini";

    //strExport is key in plugin.ini file
    var buttonText = objApp.LoadStringFromFile(languangeFileName, "strExport");
    objWindow.AddToolButton("document", "ExportButton", buttonText, "", "OnExportMDButtonClicked");
  }

InitExoprtToMdButton();
