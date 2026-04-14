import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import { Construct } from 'constructs';
import { ResourceConstants } from '../../../common/constants/resource.constants';
import { InfraConstants } from '../../../common/constants/infra.constants';

interface RedisClusterProps {
  vpc: ec2.Vpc;
  lambdaSecurityGroup: ec2.SecurityGroup;
}

export class RedisClusterConstruct extends Construct {
  readonly host: string;
  readonly port: string;

  constructor(scope: Construct, id: string, props: RedisClusterProps) {
    super(scope, id);

    const securityGroup = new ec2.SecurityGroup(this, 'Sg', {
      vpc: props.vpc,
      securityGroupName: ResourceConstants.REDIS_SG,
      description: 'Security group para ElastiCache Redis',
      allowAllOutbound: false,
    });

    securityGroup.addIngressRule(
      props.lambdaSecurityGroup,
      ec2.Port.tcp(6379),
      'Acceso Redis desde Lambda',
    );

    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'SubnetGroup', {
      description: 'Subnet group para ElastiCache Redis',
      subnetIds: props.vpc.isolatedSubnets.map(s => s.subnetId),
      cacheSubnetGroupName: `${ResourceConstants.REDIS_CLUSTER}-sng`.toLowerCase(),
    });

    const cluster = new elasticache.CfnCacheCluster(this, 'Cluster', {
      clusterName: ResourceConstants.REDIS_CLUSTER.toLowerCase(),
      cacheNodeType: InfraConstants.REDIS_NODE_TYPE,
      engine: 'redis',
      engineVersion: InfraConstants.REDIS_ENGINE_VERSION,
      numCacheNodes: 1,
      cacheSubnetGroupName: subnetGroup.ref,
      vpcSecurityGroupIds: [securityGroup.securityGroupId],
    });

    cluster.addDependency(subnetGroup);

    this.host = cluster.attrRedisEndpointAddress;
    this.port = cluster.attrRedisEndpointPort;
  }
}
