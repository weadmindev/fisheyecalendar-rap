package com.weadmin.piccolo2d_rap.example;

import java.util.ArrayList;
import java.util.List;

import org.eclipse.rap.json.JsonObject;
import org.eclipse.rap.rwt.application.AbstractEntryPoint;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Composite;

import com.weadmin.piccolo2d_rap.Piccolo2dJS;

public class ExampleOne extends AbstractEntryPoint{

	private static final long serialVersionUID = 1L;

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	protected void createContents(Composite parent) {
		parent.setLayout(null);
		Piccolo2dJS pjs = new Piccolo2dJS(parent, SWT.NONE);
		pjs.setBounds(20, 0, 1000, 600);
		pjs.showText("Hello World!");
		List list = dataModle();
		pjs.showList(list);
	}

	/**
	 * Simulation within one month of data
	 * @return
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static List dataModle(){
		JsonObject json = null;
		int randcount = 0;
		ArrayList list = new ArrayList();
		for(int i=1;i<31;i++){
			for(int j=0;j<24;j++){
				randcount = (int) (Math.random()*7);
				for(int k=0;k<randcount;k++){
					json = new JsonObject();
					json.add("savetime", "2016-11-"+(i<10?"0"+i:i) + " " +(j<10?"0"+j:j)+":"+getRandom(60)+":"+getRandom(60));
					json.add("package", getRandom(100));
					json.add("retime", new java.text.DecimalFormat("#.##").format((double)(Math.random())));
					list.add(json);
				}
			}
		}
		return list;
	}
	
	public static String getRandom(int t){
		int i = (int) (Math.random()*t);
		String s = (i<10?"0"+i:i+"");
		return s;
	}
	
}
