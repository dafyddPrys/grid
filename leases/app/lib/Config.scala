package lib

import com.amazonaws.regions.{RegionUtils, Region}
import com.gu.mediaservice.lib.config.{Properties, CommonPlayAppConfig, CommonPlayAppProperties}
import com.amazonaws.auth.{BasicAWSCredentials, AWSCredentials}


object Config extends CommonPlayAppProperties with CommonPlayAppConfig {

  val appName = "leases"

  val properties = Properties.fromPath("/etc/gu/leases.properties")

  val awsCredentials: AWSCredentials =
    new BasicAWSCredentials(properties("aws.id"), properties("aws.secret"))

  val dynamoRegion: Region = RegionUtils.getRegion(properties("aws.region"))

  val keyStoreBucket = properties("auth.keystore.bucket")

  val topicArn = properties("sns.topic.arn")

  val leasesTable = properties("dynamo.tablename.leasesTable")

  val rootUri = services.leasesBaseUri
  val kahunaUri = services.kahunaBaseUri
  val loginUriTemplate = services.loginUriTemplate

  private lazy val corsAllowedOrigins = properties.getOrElse("cors.allowed.origins", "").split(",").toList
  val corsAllAllowedOrigins = services.kahunaBaseUri :: corsAllowedOrigins
}
