# 安装

curl -O https://artifacts.elastic.co/downloads/logstash/logstash-5.5.1.tar.gz

解压

tar -zxf logstash-5.5.1.tar.gz

> 假设日志格式为：
```
2019-05-07-16:03:04|10.4.29.158|120.131.74.116|WEB|11299073|http://quxue.renren.com/shareApp?isappinstalled=0&userId=11299073&from=groupmessage|/shareApp|null|Mozilla/5.0 (iPhone; CPU iPhone OS 8_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12D508 MicroMessenger/6.1.5 NetType/WIFI|duringTime|98||
```

# 配置
```config
input {
    file {
            path => "/data/web/logstash/logFile/*"
            start_position => "beginning" #从文件开始处读写
    }
    # stdin {}  #可以从标准输入读数据
}

filter {

  #定义数据的格式
  grok {
    match => { 
        "message" => "%{DATA:timestamp}\|%{IP:serverIp}\|%{IP:clientIp}\|%{DATA:logSource}\|%{DATA:userId}\|%{DATA:reqUrl}\|%{DATA:reqUri}\|%{DATA:refer}\|%{DATA:device}\|%{DATA:textDuring}\|%{DATA:duringTime:int}\|\|"
    }
  }
  #定义时间戳的格式
  date {
    match => [ "timestamp", "yyyy-MM-dd-HH:mm:ss" ]
    locale => "cn"
  }
  #定义客户端的IP是哪个字段（上面定义的数据格式）
  geoip {
    source => "clientIp"
  }


  #定义客户端设备是哪一个字段
  useragent {
    source => "device"
    target => "userDevice"
  }

  #需要进行转换的字段，这里是将访问的时间转成int，再传给Elasticsearch
  mutate {
    convert => ["duringTime", "integer"]
  }

}

output {
    #将输出保存到elasticsearch，如果没有匹配到时间就不保存，因为日志里的网址参数有些带有换行
    #  if [timestamp] =~ /^\d{4}-\d{2}-\d{2}/ {
    #        elasticsearch { host => localhost }
    #  }

       #输出到
       stdout{ codec => json}

       #定义访问数据的用户名和密码
    #  user => webService
    #  password => 1q2w3e4r
}
```

# 启动
bin/logstash -f config/logstash.conf --config.reload.automatic