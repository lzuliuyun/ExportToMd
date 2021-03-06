var config = {
    mdPath:"E:/01 Personal Doc/10 Blog/01 hexo-blog/source/_posts/",
    imgPath:"E:/01 Personal Doc/10 Blog/01 hexo-blog/source/images/",
    showRootDir: true
}

function OnExportMDButtonClicked() {
    // var objBrowser = WizExplorerApp.Window.CurrentDocumentBrowserObject;
    // objBrowser.ExecuteScript("document.body.innerText", function(docText) {
    //     objWindow.ShowMessage("文档内容为空, 导出失败" + docText, "提示", 0x40);
    // });

    var objApp = WizExplorerApp,
        objWindow = objApp.Window,
        objDocument = objWindow.CurrentDocument,
        objCommon = objApp.CreateWizObject("WizKMControls.WizCommonUI"),
        tempDocument = getTempDocumentInfo(objCommon, objDocument);

    if (!tempDocument.text) {
        objWindow.ShowMessage("文档内容为空, 导出失败", "提示", 0x40);
        return false;
    }

    tempDocument.text = modifyDocument(objCommon, objDocument, tempDocument.text);
    saveFile(objCommon, objDocument, objWindow, tempDocument);
}

function getTempDocumentInfo(objCommon, objDocument) {
    var tempPath = objCommon.GetSpecialFolder("TemporaryFolder") + "export_md_temp/";
    objCommon.CreateDirectory(tempPath);

    tempPath += objDocument.GUID + "/";
    objCommon.CreateDirectory(tempPath);

    var tempImgPath = tempPath + "index_files/",
        tempFile = tempPath + "index.html";

    objCommon.CreateDirectory(tempImgPath);
    objDocument.SaveToHtml(tempFile, 0);

    return {
        text: convertHtmlToText(objCommon.LoadTextFromFile(tempFile)),
        imagePath: tempImgPath
    }
}

function convertHtmlToText(text) {
    var match = text.match('<body>(.*)</body>');
    text = match[1];
    text = text.replace(/<br\/>/gm, '\n');
    text = text.replace(/&lt;/gm, '<');
    text = text.replace(/&gt;/gm, '>');

    return text;
}

function modifyDocument(objCommon, objDocument, text) {
    text = setHeadInfo(objCommon, objDocument, text);
    text = setImagePath(text);
    text = deleteEdtag(text);
    return text;
}

function setImagePath(text) {
    return text.replace(/index_files/g,"/images");
}

function deleteDescLabel(text) {
    return  text = text.replace(/---[\s\S]*?---/gm, '')
}

function deleteEdtag (text) {
    //fix unuseful content bug
    return text.replace(/<ed_tag.*?<\/ed_tag>/g, '');
}

function setHeadInfo(objCommon, objDocument, text) {
    var categories = objDocument.Parent.Name,
        dtCreated = new Date(objDocument.DateCreated),
        timeCreated = objCommon.ToLocalDateString(dtCreated, false) + " " + objCommon.ToLocalTimeString(dtCreated),
        location = objDocument.Location;

    if (config.showRootDir && location.match(/^\/([\w-]+)\/?/)) {
        categories = location.match(/^\/([\w-\s]+)\/?/)[1]
    }

    var head = addHeadToDocument(text, {
        title: objDocument.Title.replace(/\.md$/g, ''),
        tags: objDocument.Tags,
        date: timeCreated,
        categories: categories
    })

    text = deleteDescLabel(text)

    text = head + text;
    return text;
}

function saveFile(objCommon, objDocument, objWindow, tempDocument) {
    //save file
    var filename = config['mdPath'] + objDocument.Title.replace(/\.md$/g, '') + ".md";
    objCommon.SaveTextToFile(filename, tempDocument.text, "utf-8");

    //save image. copy file from tempory to target folder 复制图片
    var path = objCommon.EnumFiles2(tempDocument.imagePath, "*.*", false);
    if(!path) {
        objWindow.ShowMessage("文档无图片，导出完成", "提示", 0x40);
        return true;
    }

    var imgPath = config['imgPath'],
        pathArr = path.split("\n"),
        len = pathArr.length,
        curPath = "",
        name = "";

    for (var i = 0; i< len; i++) {
        curPath = pathArr[i];
        name = curPath.substring(curPath.lastIndexOf("/") + 1, curPath.length);;
        curPath = imgPath + name;
        objCommon.CopyFile(pathArr[i], curPath);
    }

    objWindow.ShowMessage("文档有图片，导出完成", "提示", 0x40);
}

function addHeadToDocument(text, docInfo){
    var tags, moreLabels;

    //tags
    var ret = [];
    for (var i = 0; i < docInfo.tags.Count; i++) {
        ret.push(docInfo.tags.Item(i).Name);
    }

    tags = ret.join(",");

    var exec = /---([\s\S]*?)---/gm.exec(text)

    moreLabels = exec ? exec[1].replace(/^\s*|\s*$/g, '').replace(/!\[\]\((.*?)\)/g, '$1') : '';
    //morelabels
    if (moreLabels) {
        var encodeLabels = encodeURIComponent(moreLabels);
        encodeLabels = encodeLabels.replace(/%3A%C2%A0/g, '%3A%20')
        moreLabels = decodeURIComponent(encodeLabels);
    }

    moreLabels = moreLabels || '\n';

    var head = "---" + "\n"
            + "title: " + docInfo.title + "\n"
            + "date: " + docInfo.date + "\n"
            + "categories: " + docInfo.categories + "\n"
            + "tags: [" + tags + "]\n"
            + "comments: " + "true" + "\n"
            + "toc: " + "true" + "\n"
            + moreLabels + "\n"
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
