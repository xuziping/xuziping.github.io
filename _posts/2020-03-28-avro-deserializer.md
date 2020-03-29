---
layout: post
title: Kafka Avro Message反序列化的两种方式
categories: Kafka
description: Kafka知识整理
keywords: Kafka,Avro,项目手记
---

### 【Kick Off】
项目中有新的需求，需要消费第三方Kafka一个新建的Topic的消息，结构体已经给出不算复杂；由于之前和第三方已经消费以及生产过若干Kafka的消息，都是基于Avro格式，因此觉得没有什么问题，简单估了一个点。

### 【In Progress 之 JSON消息体的反序列化】
消费Kafka Topic的代码花了半天时间三下五除二搞定，然后就进入了调试。对方建的测试消息不多，奇怪的是传来的Avro消息体和以前处理的不太一样，之前消费的Avro消息是使用对方提供的JAR，JAR中已经有现成的自动生成的Avro Object；这次可能第三方换了一个项目组，没有提供打好包的消息体。然后很奇怪地发现对方Produce的消息中竟然还有JSON格式，啊哈，于是很快写了一个JSON反序列化类去处理对方的消息体:


	public static class XXXXDeserializer implements Deserializer<XXXXKafkaMessage> {
	
	    @Override
	    public void configure(Map configs, boolean isKey) {
	    }
	
	    @Override
	    public XXXXKafkaMessage deserialize(String topic, byte[] data) {
	
	        XXXXKafkaMessage message = null;
	        try {
	            log.info("Deserializer Kafka message, data={}", new String(data));
	            String dataString = StringUtils.newString(data, "UTF8");
	            message = new Gson().fromJson(dataString, XXXXKafkaMessage);
	        } catch (Exception e) {
	            log.error("Failed to deserializer", e);
	        }
	        return message;
	    }
	
	    @Override
	    public void close() {
	    }
	}

在消费者配置类中反序列化类配好：

	 put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, XXXXDeserializer.class);

一次成功，能够顺利消费对方的Message了！只是收到的消息体有几个字段拼错了，有几个字段竟然没传值，另外偶尔有几条Avro格式的Message夹在其中有些碍眼... ？于是Slack上发消息去问对方开发人员多生产一些靠谱的测试数据，顺带问了下为啥既有Avro格式的数据，又有JSON格式的Message混杂着嘞？

### 【Blocked 之 NOT JSON】
消息过了一天传来了，对方承认自己字段拼写错误以及关键字段的缺失... 然后遗憾地告诉我请忽略JSON格式的Message，他们收到需求变动，特地把消息体改回Avro格式了。好吧...，有点意料之中，毕竟之前消费他们的Topic，消息也是基于Avro格式的。然后问他们要像往常那样打好包的Avro工具自动生成的Object，被告知没有，但给了我一份schema，还说似乎改成了Schema Registry。Schema Registry是什么鬼？没事，那就自食其力吧！

### 【In Progress 之 自带Schema的AVRO消息体的反序列化】
虽然之前没有用过Avro，但学起来不难，直接到confluent.io网站上下载 avro-tools.jar，其中文档也很详细：

> https://avro.apache.org/docs/current/gettingstartedjava.html#download_install

官网找了个schema的例子，大致长这样：

	{
	 "namespace": "example.avro",
	 "type": "record",
	 "name": "User",
	 "fields": [
	     {"name": "name", "type": "string"},
	     {"name": "favorite_number",  "type": ["int", "null"]},
	     {"name": "favorite_color", "type": ["string", "null"]}
	 ]
	}

下载好avro-tools.jar之后，写一个schema文件，记得把schema中的namespace改成生成的代码要放在项目中的包路径，运行下面的命令，根据schema生成

`java -jar /path/to/avro-tools-1.9.2.jar compile schema <schema file> <destination>`

工作中处理的Kakfa消息是基于Avro格式，看了下自己生成的代码，和之前消费其它Topic时第三方提供的JAR中的消息体代码是类似的，消息体中自带了Schema定义。把生成好的类拷到项目中。

把消费者配置中记得反序列化类改成ByteArrayDeserializer.class

	put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ByteArrayDeserializer.class);
	 
还记得引入avro的jar

	<dependency>
	  <groupId>org.apache.avro</groupId>
	  <artifactId>avro</artifactId>
	  <version>1.9.2</version>
	</dependency>
      
具体反序列化Avro格式消息体的代码网上很多，这里用的是DatumReader去解析，如下：

    public static SpecificRecord convert(Schema schema, byte[] bytes) throws IOException {

        DatumReader<SpecificRecord> datumReader = new SpecificDatumReader<>(schema);
        try {
            DataFileReader<SpecificRecord> dataFileReader = new DataFileReader<>(new SeekableByteArrayInput(bytes),
                datumReader);
            SpecificRecord record = null;
            while (dataFileReader.hasNext()) {
                record = dataFileReader.next();
            }
            return record;
        } catch (IOException e) {
            log.error("Failed to convert", e);
            throw e;
        }
    }
    
注意，这里的Schema对象其实就是之前avro-tools.jar生成的dto代码中自带的。如果没有代码自动生成dto，那么这里schema也可以通过直接解析schema文件/字符串获取，如下：

    String USER_SCHEMA = "{\"type\": \"record\", \"name\": \"User\", " + 
            "\"fields\": [{\"name\": \"id\", \"type\": \"int\"}, " + 
            "{\"name\": \"name\",  \"type\": \"string\"}, {\"name\": \"age\", \"type\": \"int\"}]}";
    Schema.Parser parser = new Schema.Parser();
    Schema schema = parser.parse(USER_SCHEMA);
  

到此仿佛大功告成，至少换在以前的Topic是能够正常消费了。

### 【Blocked 之 NOT AVRO 自生成消息体】

写好的消费者死活消费不成对方的Avro Message，报的错都是 InvalidAvroMagicException，debug进去看似乎消息的magic number解析不出来:(

然后再上Slack找对方开发，从JAR包的版本号开始怀疑，从avro-tool-1.9.2降级到1.8.2等等，此中折腾掉许久时间。然而，还是同样的Invalid Avro Magic Exception!

最后，debug以前的Topic Avro Message，发现和现在的不是一个样哈，以前的message分明会带上Obj字符串以及一个schema定义之后才是数据，而目前的message直接就是数据。

问题找到了，Avro在Schema Registry下的结构体和之前用avro-tools auto-generated的结构体不一样了！


###【In Progress 之 Schema Registry下的AVRO消息体的反序列化】

问题确定好，改起来就快了。首先引入avro serializer的JAR包：

	compile ('io.confluent:kafka-avro-serializer:4.1.3')

然后，在Consumer Configure里加上schema registry url的配置，以及把反序列化类改成KafkaAvroDeserializer.class：

    put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, KafkaAvroDeserializer.class);
    put(AbstractKafkaAvroSerDeConfig.SCHEMA_REGISTRY_URL_CONFIG, "https://XXXX");
    ......
    KafkaConsumer<String, GenericRecord> consumer = new KafkaConsumer(properties);
    
之后，在Kafka消费者类中直接消费ConsumerRecords<String, GenericRecord>就可以了。这是一个测试DEMO：

    public class ConsumerTest {
          private static final Logger log = LoggerFactory.getLogger(ConsumerTest.class);

	    public ConsumerTest() {
	    }

	    public static void main(String[] args) {
	        System.setProperty("javax.net.ssl.keyStore", "XXXX");
	        System.setProperty("javax.net.ssl.keyStorePassword", "XXXX");
	        
	        Properties properties = new Properties();
	        properties.put("schema.registry.url", "XXXXX");
	        properties.put("bootstrap.servers", "XXXXXX");
	        properties.put("group.id", "XXXXX");
	        properties.put("key.deserializer", StringDeserializer.class.getName());
	        properties.put("value.deserializer", KafkaAvroDeserializer.class.getName());
	        properties.put("security.protocol", "SSL");
	        put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
	        properties.put("ssl.keystore.location", "XXXXXX");
	        properties.put("ssl.keystore.password", "XXXXX");
	        properties.put("ssl.key.password", "XXXXX");
	        KafkaConsumer<String, GenericRecord> consumer = new KafkaConsumer(properties);
	        consumer.subscribe(Arrays.asList("XXXXX"));
	
	        try {
	            while(true) {
	                while(true) {
	                    try {
	                        ConsumerRecords<String, GenericRecord> records = consumer.poll(1000L);
	                        Iterator var4 = records.iterator();
	
	                        while(var4.hasNext()) {
	                            ConsumerRecord<String, GenericRecord> record = (ConsumerRecord)var4.next();
	                            GenericRecord user = (GenericRecord)record.value();
	                            log.info("value={}", user);
	                        }
	                    } catch (Exception var11) {
	                        log.error("error occurred");
	                    }
	                }
	            }
	        } catch (Exception var12) {
	            var12.printStackTrace();
	        } finally {
	            consumer.close();
	        }
	    }
	}


看似已经万事大吉了~

### 【Blocked 之 NOT AVRO 自生成消息体】

但是，跑了上面DEMO，却仍然报错。

> Caused by: org.apache.kafka.common.errors.SerializationException: Unknown magic byte!
Caused by: org.apache.kafka.common.errors.SerializationException: Error deserializing Avro message for id -1

感觉似乎仍然是没法处理magic number！

和第三方开发人员找了好一阵才才发现是因为topic中还有很多之前格式不正确的message导致的。把AUTO\_OFFSET\_RESET\_CONFIG删掉即可：

	put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
	
至此终于大功告成，万事大吉了！

### 总结

技术的更新日新月异，以前用JSON感觉很顺手，但为了提高效率，对消息体进行压缩编码而出现Avro以及Protobuf等迫使人需要不断学习。自动生成的Avro message自带schema（类似于每个细胞自带基因信息），设计者觉得schema冗余而提出schema registry，使其成为趋势... 开发者有时候很像一个愚者，像阿甘那样在公路上努力奔跑——停下来也许能让心肺舒服，但两旁的风景也就停滞住了，不是吗~