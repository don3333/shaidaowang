import fs from 'fs'
import path from 'path'

const cidrs = [
  '116.8.0.0/14',
  '113.16.0.0/15',
  '116.252.0.0/15',
  '222.83.128.0/17',
  '222.84.0.0/16',
  '125.36.0.0/14',
  '175.152.0.0/14'
]

function ipv4ToInt(ip) {
  const parts = ip.split('.').map(Number)
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
}

function intToIpv4(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join('.')
}

function parseCIDR(cidr) {
  const [ip, prefixStr] = cidr.split('/')
  const prefix = Number(prefixStr)
  const base = ipv4ToInt(ip)
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  const network = base & mask
  const size = 2 ** (32 - prefix)
  const start = network
  const end = (network + size - 1) >>> 0
  const usableStart = size > 2 ? (start + 1) >>> 0 : start
  const usableEnd = size > 2 ? (end - 1) >>> 0 : end
  return { start: usableStart, end: usableEnd }
}

const ranges = cidrs.map(parseCIDR)

function randomInt(min, max) {
  return (Math.floor(Math.random() * (max - min + 1)) + min) >>> 0
}

function pickRandomAddress() {
  const r = ranges[Math.floor(Math.random() * ranges.length)]
  return randomInt(r.start, r.end)
}

export function getGuangxiIps(targetCount = 1000) {
  const set = new Set()
  while (set.size < targetCount) {
    const addr = pickRandomAddress()
    set.add(addr)
  }
  return Array.from(set).map(intToIpv4)
}


