//
//  main.swift
//  xhook
//
//  Created by Houfeng on 2024/4/11.
//

import Foundation
import AppKit
import Network

let conn = NWConnection(host: "127.0.0.1", port: 5006, using: .udp)
conn.start(queue: .global())

func output (type: String, event: NSEvent) {
    var point = NSEvent.mouseLocation
    point.y = (NSScreen.main?.frame.height ?? 0)-point.y;
    let message = "type=\(type)&button=\(event.buttonNumber)&window=\(event.windowNumber)&x=\(point.x)&y=\(point.y)\n"
    print(message)
    if conn.state==NWConnection.State.ready {
        conn.send(content:message.data(using: .utf8) ,completion: .contentProcessed( { err in
            if let error = err {
                return;
            }
        }))
    }
}

NSEvent.addGlobalMonitorForEvents(matching: .any){ event in
    switch (event.type){
    case .leftMouseDown :
        output(type:"mousedown", event:event)
    case .rightMouseDown :
        output(type:"mousedown", event:event)
    case .leftMouseUp :
        output(type:"mouseup", event:event)
    case .rightMouseUp :
        output(type:"mouseup", event:event)
    case .mouseMoved :
        output(type:"mousemove", event:event)
    case .leftMouseDragged :
        output(type:"mousemove", event:event)
        output(type:"mousedragged", event:event)
    case .rightMouseDragged :
        output(type:"mousemove", event:event)
        output(type:"mousedragged", event:event)
    @unknown default:
        return;
    }
}

// This keeps the app running & makes sure events are received
NSApplication.shared.run()
