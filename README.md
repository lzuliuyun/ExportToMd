为知笔记导出MarkDown插件，只支持MarkDown格式文档导出。

### 步骤

* 1.克隆项目到本地
* 2.复制ExportToMd文件夹到数据`存储目录`下的Plugins目录中
![](/images/afc9fcec-4ca7-4913-8cd9-180d8a3f838b.png)
![](/images/3f17a9ea-472a-4e5c-899f-3922030c8cd1.png)

* 3.配置导出的markdown文件和图片目录路径参数
![](/images/4e8292e4-634e-47f9-8799-6f65ca12c3ae.png)
* 4.重新启动程序
* 5.导出文档
![](/images/936218e6-be30-4371-82f9-5d614e07785d.png)

### 日志

[2018-07-10]
新增配置项showRootDir导出标签categories是否为文件路径根目录
维持原生语法`---`配置标签
cover支持粘贴图片并导出为相对路径，配合插件[hexo-image-cdn](https://github.com/lzuliuyun/hexo-image-cdn)使用更好哦

[2018-04-12]
自定义`!---`前后包裹语法导出配置到头部
![](/images/3a0f2c85-fda0-449b-80cb-8773cc5baf65.png)

[2017-03-19]
更新支持为知笔记4.5以上版本